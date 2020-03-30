var mysql = require('mysql');

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    port: '3306',
    password : 'Athieu98a1k26',
    database : 'recommender_system'
  });
connection.connect();

function userRating()
{
  this.user='';
  this.rating=[];
}
function table_rs()
{
  this.user_rating=[];
  this.array_idsanpham=[];
}

function ScoreItem()
{
  this.number_score;
  this.ID;
}
//load data từ database
function load_data(ketqua)
{
  var table=new table_rs();
  connection.query('select userid,id_sanpham,luotxemsanpham,luotmuasanpham,rating from hanhvi',function(error,data,fields)
  {
    if(error) throw error;
    else
    {
      //mảng các user distinct
      var user_distinct=data.map(U=>U.userid).filter((value,index,self)=>{
        return self.indexOf(value)==index;
      })
      //mảng các id sản phẩm distinct
      var id_sanpham_distinct=data.map(U=>U.id_sanpham).filter((value,index,self)=>{
        return self.indexOf(value)==index;
      })
      
      //lấy toàn bộ id sản phẩm
      table.array_idsanpham=id_sanpham_distinct;
      // duyệt toàn bộ user
      user_distinct.map(userCurrent=>{
        //tạo ra 1 đối tượng user
        var ur=new userRating();
        ur.user=userCurrent;

        var list_data_user_current=data.filter((value,index,self)=>{
          return value.userid===userCurrent;
        })

        //duyệt toàn bộ sản phẩm 
        table.array_idsanpham.map(id_sanpham_current=>{
          //kiểm tra xem sản phẩm có chưa dữ liệu hành vi hay không,
          var codulieuhanhvi=false;
          list_data_user_current.map(value_current=>{
            if(id_sanpham_current===value_current.id_sanpham)
            {
              ur.rating.push(getRating(value_current.luotxemsanpham,value_current.luotmuasanpham,value_current.rating));
              //có dữ liệu hành vi
              codulieuhanhvi=true;
            }
          })
          if(!codulieuhanhvi)
          {
            ur.rating.push(0);
          }

        })
        table.user_rating.push(ur);
      })
      return ketqua(table);
    }
  })

}

function getRating(luotxemsanpham,luotmuasanpham,ratingsanpham)
{
  let luotxem=1;
  let luotmua=2;
  let rating=2;
  let minWeight = 0.1;
  let maxWeight = 10;
  let sumrating=luotxem*luotxemsanpham+luotmua*luotmuasanpham+rating*ratingsanpham;
  return Math.min(maxWeight,Math.max(minWeight,sumrating));
}
//khởi tạo giá trị
function Initialize(table,numFeatures=15,ketqua)
{
  //số lượng user
  var numUser=table.user_rating.length;
  //số lượng item
  var numItem=table.array_idsanpham.length;
  var userBiases=[];
  var itemBiases=[];
  var userFeatures=[];
  var itemFeatures=[];

  for(let i=0;i<numUser;i++)
  {
    userBiases.push(0);
    var row_user=new Array();
    for(let j=0;j<numFeatures;j++)
    {
      var number=Number(Math.random().toFixed(1));
      row_user.push(number);
    }
    userFeatures.push(row_user);
  }


  for(let i=0;i<numItem;i++)
  {
    itemBiases.push(0);
    var row_item=new Array();
    for(let j=0;j<numFeatures;j++)
    { 
      var number=Number(Math.random().toFixed(1));
      row_item.push(number);
    }
    itemFeatures.push(row_item);
  }

  return ketqua(numUser,numItem,userBiases,itemBiases,userFeatures,itemFeatures);
}
//lấy giá trị sản phẩm từ 2 ma trận
function GetDotProduct(array_userFeatures,array_itemFeatures,numFeatures)
{
  var sum=0;
  for(let i=0;i<numFeatures;i++)
  {
    sum+=array_userFeatures[i]*array_itemFeatures[i];
  }
  return sum;
}
//lấy trung bình rating toàn cục
function GetAverageRating(table,numUser,numItem)
{
  var sum=0;
  var count=0;
  for(let i=0;i<numUser;i++)
  {
    for(let j=0;j<numItem;j++)
    {
      if(table.user_rating[i].rating[j]!=0)
      {
        sum+=table.user_rating[i].rating[j];
        count++;
      }
    }
  }
  return sum/count;
}
//giải thuật bias matrix-factorizeMatrix
function FactorizeMatrix(table,numUser,numItem,userBiases,itemBiases,userFeatures,itemFeatures,regularizationTerm=0.02,learningDescent = 0.99,learningIterations=30,learningRate=0.05,numFeatures=15,ketqua)
{
  var averageGlobalRating=GetAverageRating(table,numUser,numItem);
  var rmseAll=[];
  var squareError;
  var count;
  for(let i=0;i<learningIterations;i++)
  {
    squareError=0;
    count=0;

    for(let userIndex=0;userIndex<numUser;userIndex++)
    {
      for(let itemIndex=0;itemIndex<numItem;itemIndex++)
      {
        if(table.user_rating[userIndex].rating[itemIndex]!=0)
        {
          var predictedRating=averageGlobalRating+userBiases[userIndex]+itemBiases[itemIndex]+GetDotProduct(userFeatures[userIndex],itemFeatures[numItem-1-itemIndex],numFeatures);
          var error=table.user_rating[userIndex].rating[itemIndex]-predictedRating;
          if(isNaN(predictedRating))
          {
            throw "lỗi nặng :)";
          }
          squareError += Math.pow(error,2);
          count++;
          averageGlobalRating += learningRate * (error - regularizationTerm * averageGlobalRating);
          userBiases[userIndex] += learningRate * (error - regularizationTerm * userBiases[userIndex]);
          itemBiases[itemIndex] += learningRate * (error - regularizationTerm * itemBiases[itemIndex]);

          for(let featureIndex=0;featureIndex<numFeatures;featureIndex++)
          {
            userFeatures[userIndex][featureIndex]+=learningRate*(error*itemFeatures[numItem-1-itemIndex][featureIndex]-regularizationTerm*userFeatures[userIndex][featureIndex]);
            itemFeatures[numItem-1-itemIndex][featureIndex]+=learningRate*(error*userFeatures[userIndex][featureIndex]-regularizationTerm*itemFeatures[numItem-1-itemIndex][featureIndex]);
          }
        }
      }
    }
    squareError = Math.sqrt(squareError / count);
    rmseAll.push(squareError);
    learningRate *= learningDescent;
  }
  return ketqua(rmseAll,userFeatures,itemFeatures);
}
//lấy vị trí user sẽ gợi ý
function get_index_user(table,numUser,username)
{
  for(let i=0;i<numUser;i++)
  {
    //lấy vị trí index của user
    if(table.user_rating[i].user===username)
    {
      return i;
    }
  }
  return "không tìm thấy user";
}
//điền toàn bộ số User
function listNumBer_User(table,vitri_user_rs,numItem,itemFeatures,userFeatures,numFeatures)
{
  var array_Number_user=[];
  for(let itemindex=0;itemindex<numItem;itemindex++)
  {
    if(table.user_rating[vitri_user_rs].rating[itemindex]==0)
    {
      var score=new ScoreItem();
      score.ID=table.array_idsanpham[itemindex];
      var number=0;
      for(let featureIndex=0;featureIndex<numFeatures;featureIndex++)
      {
        number+=userFeatures[vitri_user_rs][featureIndex]*itemFeatures[numItem-1-itemindex][featureIndex];
      }
      score.number_score=number;
      array_Number_user.push(score);
    }
  }
  return array_Number_user;
}
function suggestions(table,numUser,numItem,username,numFeatures,itemFeatures,userFeatures,selectNumberItem,ketqua)
{
  var vitri_user_rs=get_index_user(table,numUser,username);
  if(Number.isInteger(vitri_user_rs))
  {
    var list_Number=listNumBer_User(table,vitri_user_rs,numItem,itemFeatures,userFeatures,numFeatures);
    list_Number=list_Number.sort((a,b)=>b.number_score-a.number_score).slice(0,selectNumberItem);
    return ketqua(list_Number);
  }
  else
  {
    return ketqua(vitri_user_rs);
  }
}

function recommender_system(username,selectNumberItem,ketqua)
{
  load_data(function(table)
  {
    Initialize(table,15,function(numUser,numItem,userBiases,itemBiases,userFeatures,itemFeatures){
      FactorizeMatrix(table,numUser,numItem,userBiases,itemBiases,userFeatures,itemFeatures,0.01,0.99,20,0.08,10,function(rmseAll,userFeatures,itemFeatures)
      {
        suggestions(table,numUser,numItem,username,15,itemFeatures,userFeatures,selectNumberItem,function(list_id_sanpham)
        {
          return ketqua(list_id_sanpham);
        });
      })
    })
  })
}

module.exports.recommender_system=recommender_system;