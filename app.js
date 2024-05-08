var Youtube = require('youtube-node');
var youtube = new Youtube();

var limit = 10;  // 출력 갯수

youtube.setKey('AIzaSyDQYRA4XEY0RX2M1lkyiV_hWwldaZToQGM'); // API 키 입력

//// 검색 옵션 시작
youtube.addParam('order', 'viewCount'); // 평점 순으로 정렬
youtube.addParam('type', 'video');   // 타입 지정
youtube.addParam('videoLicense', 'creativeCommon'); // 크리에이티브 커먼즈 아이템만 불러옴
//// 검색 옵션 끝

/* 검색 옵션 종류
order	date, rating, relevance, title, videoCount, viewCount	정렬 조건 지정
regionCode	kr, jp, us...	국가 지정
safeSearch	none, moderate, strict	제한된 컨텐츠를 포함할지 여부 지정
type	channel, playlist, video	검색 대상 유형 지정
videoDuration	any, long, medium, short	검색 동영상의 길이 지정
videoLicense	any, creativeCommon, youtube	검색 동영상의 라이선스 지정
*/
const videos = [];

async function crawlYouTubeVideos(keyword) {
    try {   
        youtube.search(keyword, limit, function (err, result) { 
            if (err) { console.log(err); return; } 
        
            //console.log(JSON.stringify(result, null, 2)); //전체리스트
              
            var items = result["items"]; 
            for (var i in items) { 
                var it = items[i];
                var title = it["snippet"]["title"];
                var video_id = it["id"]["videoId"];
                var url = "https://www.youtube.com/watch?v=" + video_id;

                //console.log("title : " + title);
                //console.log("url : " + url);

                videos.push( [title, url] );
            }
        });
        
        return videos;

    } catch (error) {
        console.error('Error:', error);
    }
}
crawlYouTubeVideos('홈트').then(videos => {
    console.log('Videos:', videos);
});
