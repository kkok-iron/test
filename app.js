var Youtube = require('youtube-node');
var youtube = new Youtube();
var shorts = new Youtube();

var limit = 10;  // 출력 갯수

const mysql = require('mysql');  // mysql 모듈 로드
const conn = mysql.createConnection({  // mysql 접속 설정
    host: 'kkokiyo-mysql.c1kmsw8s42mh.ap-northeast-2.rds.amazonaws.com',
    port: '3306',
    user: 'root',
    password: 'kky240101!',
    database: 'kkokiyodb'
});


youtube.setKey('AIzaSyDQYRA4XEY0RX2M1lkyiV_hWwldaZToQGM'); // API 키 입력

//// 검색 옵션 시작
youtube.addParam('order', 'viewCount'); // 평점 순으로 정렬
youtube.addParam('type', 'video');   // 타입 지정
youtube.addParam('videoLicense', 'creativeCommon'); // 크리에이티브 커먼즈 아이템만 불러옴
//// 검색 옵션 끝

shorts.setKey('AIzaSyDQYRA4XEY0RX2M1lkyiV_hWwldaZToQGM'); // API 키 입력

//// 검색 옵션 시작
shorts.addParam('order', 'viewCount'); // 평점 순으로 정렬
shorts.addParam('type', 'video');   // 타입 지정
shorts.addParam('videoDuration' , 'short');
shorts.addParam('videoLicense', 'creativeCommon'); // 크리에이티브 커먼즈 아이템만 불러옴
//// 검색 옵션 끝

/* 검색 옵션 종류
order	date, rating, relevance, title, videoCount, viewCount	정렬 조건 지정
regionCode	kr, jp, us...	국가 지정
safeSearch	none, moderate, strict	제한된 컨텐츠를 포함할지 여부 지정
type	channel, playlist, video	검색 대상 유형 지정
videoDuration	any, long, medium, short	검색 동영상의 길이 지정
videoLicense	any, creativeCommon, youtube	검색 동영상의 라이선스 지정
*/

var videos = [];

 
function crawlYouTubeVideos(keyword) {
        
        var values;
        
        youtube.search(keyword, limit, function (err, result) { 
            if (err) { console.log(err); return; } 
        
            //console.log(JSON.stringify(result, null, 2)); //전체리스트
              
            var items = result["items"]; 
            for (var i in items) { 
                var it = items[i];
                var title = it["snippet"]["title"];
                var video_id = it["id"]["videoId"];
                var url = "https://www.youtube.com/watch?v=" + video_id;

              //  console.log("title : " + title);
              //  console.log("url : " + url);

                videos.push( [ url, title ] );
                
            }
            
            console.log(videos);

            conn.connect(function (err) {
                if(err) throw err;
                console.log('connect');
                
                var sql = "INSERT INTO content_test (media_url, title) values ?;";

                conn.query(sql, [videos], function(err, result) {

                    if(err) throw err;
                    console.log("Inserted : " + result.affectedRows);

                });
        
            });

            //conn.end();
        });
    
   // console.log(videos);
   
}


function crawlYouTubeShorts(keyword) {
    shorts.search(keyword, limit, function (err, result) { 
        if (err) { console.log(err); return; } 
    
        //console.log(JSON.stringify(result, null, 2)); //전체리스트
          
        var items = result["items"]; 
        for (var i in items) { 
            var it = items[i];
            var title = it["snippet"]["title"];
            var video_id = it["id"]["videoId"];
            var url = "https://www.youtube.com/shorts/" + video_id;

            videos.push( [ video_id, url, title]);
        }
    });

   // console.log(videos);

}

async function crawlYouTube(){
    try{
        await crawlYouTubeVideos('홈트');
        //console.log(videos)
      } catch(e) {
        console.log(e)
      }
  }

crawlYouTube();
//crawlYouTubeVideos('홈트');
//crawlYouTubeShorts('홈트');