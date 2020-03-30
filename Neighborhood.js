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

function userSimilarity()
{
  this.usersimi="";
  this.score_simi=0;
}

function itemSimilarity()
{
  this.ID=0;
  this.Rating=0;
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
function get_array_avg(table,numUser,numItem)
{
    var array_avg=[];
    var sum;
    var count;
    for(let userindex=0;userindex<numUser;userindex++)
    {
        sum=0;
        count=0;
        for(let itemindex=0;itemindex<numItem;itemindex++)
        {
            if(table.user_rating[userindex].rating[itemindex]!=0)
            {
                sum+=table.user_rating[userindex].rating[itemindex];
                count++;
            }
        }
        array_avg.push(sum/count);
    }
    return array_avg;
}
function get_table_avg(table,numUser,numItem,Array_Avg)
{
    for(let userindex=0;userindex<numUser;userindex++)
    {
        for(let itemindex=0;itemindex<numItem;itemindex++)
        {
            if(table.user_rating[userindex].rating[itemindex]!=0)
            {
                table.user_rating[userindex].rating[itemindex]=table.user_rating[userindex].rating[itemindex]-Array_Avg[userindex];
            }
        }
    }
    return table;
}

function Matrix_AVG(table,numUser,numItem,ketqua)
{
    var Array_Avg=get_array_avg(table,numUser,numItem);
    var table_avg=get_table_avg(table,numUser,numItem,Array_Avg);
    return ketqua(table_avg);
}

function getUser_index(table,user,numUser)
{
    for(let userindex=0;userindex<numUser;userindex++)
    {
        if(table.user_rating[userindex].user===user)
        {
            return userindex;
        }
    }
}

function tichvohuong(table_avg,vitriuser_index,numItem)
{
  var num=0;
  for(let itemindex=0;itemindex<numItem;itemindex++)
  {
    num+=Math.pow(table_avg.user_rating[vitriuser_index].rating[itemindex],2);
  }
  return Math.sqrt(num);
}

function getNumberSimilarity(table_avg,userindex,numUser,numItem,vitriuser_index,tichvohuong_vitriuser_index)
{
  var dotProduct=0;
  var tichvohuong_userindex=tichvohuong(table_avg,userindex,numItem);
  var usersimi=new userSimilarity();
  usersimi.usersimi=table_avg.user_rating[userindex].user;
  for(let itemindex=0;itemindex<numItem;itemindex++)
  {
    dotProduct+=table_avg.user_rating[vitriuser_index].rating[itemindex]*table_avg.user_rating[userindex].rating[itemindex];
  }
  usersimi.score_simi= dotProduct/(tichvohuong_userindex*tichvohuong_vitriuser_index);
  return usersimi;
}

function Cosine_Similarity(table_avg,numUser,numItem,vitriuser_index,Neighborhood_based,ketqua)
{
  var tichvohuong_vitriuser_index=tichvohuong(table_avg,vitriuser_index,numItem);
  var Array_similarity=[];
  for(let userindex=0;userindex<numUser;userindex++)
  {
    if(userindex!=vitriuser_index)
    {
      Array_similarity.push(getNumberSimilarity(table_avg,userindex,numUser,numItem,vitriuser_index,tichvohuong_vitriuser_index))
    }
    
  }
  return ketqua(Array_similarity.sort((a,b)=>b.score_simi-a.score_simi).slice(0,Neighborhood_based));
}

function getarrayuser_neighborhood(table_avg,numUser,list_user_neighborhood,Neighborhood_based)
{
  var arrayuser_neighborhood=[];
  var dem=0;
  for(let userindex=0;userindex<numUser;userindex++)
  {
    if(dem===Neighborhood_based)
    {
      break;
    }
    for(let i=0;i<list_user_neighborhood.length;i++)
    {
      if(table_avg.user_rating[userindex].user===list_user_neighborhood[i].usersimi)
      {
        arrayuser_neighborhood.push(table_avg.user_rating[userindex].rating);
        dem++;
      }
    }

  }
  return arrayuser_neighborhood;
}

function getlistID_Recommender_system(table_avg,numUser,numItem,list_user_neighborhood,Neighborhood_based,numberItemsuggestions,ketqua)
{
  var arrayuser_neighborhood=[];
  var list_array_ID=[];
  arrayuser_neighborhood=getarrayuser_neighborhood(table_avg,numUser,list_user_neighborhood,Neighborhood_based);
  var sum;
  for(let itemindex=0;itemindex<numItem;itemindex++)
  {
    sum=0;
    var itemsimi=new itemSimilarity();
    for(let i=0;i<arrayuser_neighborhood.length;i++)
    {
      sum+=arrayuser_neighborhood[i][itemindex];
    }
    itemsimi.ID=table_avg.array_idsanpham[itemindex];
    itemsimi.Rating=sum;
    list_array_ID.push(itemsimi);
  }

  return ketqua(list_array_ID.sort((a,b)=>b.Rating-a.Rating).slice(0,numberItemsuggestions));
}

function Neighborhood_based(userName,Neighborhood_based=2,numberItemsuggestions=5,ketqua)
{
    load_data(function(table)
    {
        var numUser=table.user_rating.length;
        var numItem=table.array_idsanpham.length;
        var vitriuser_index=getUser_index(table,userName,numUser);
        Matrix_AVG(table,numUser,numItem,function(table_avg)
        {
            Cosine_Similarity(table_avg,numUser,numItem,vitriuser_index,Neighborhood_based,function(list_user_neighborhood)
            {
              getlistID_Recommender_system(table_avg,numUser,numItem,list_user_neighborhood,Neighborhood_based,numberItemsuggestions,function(list_suggestions){
                return ketqua(list_suggestions);
              });
            })
        })
    })
}


module.exports.Neighborhood=Neighborhood_based;