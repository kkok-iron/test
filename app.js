const { google } = require('googleapis');
const dotenv = require('dotenv');
const iso8601 = require('iso8601-duration');

dotenv.config();

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY,
});

const mysql = require('mysql');  // mysql 모듈 로드
const connection = mysql.createConnection({  // mysql 접속 설정
    host: 'kkokiyo-mysql.c1kmsw8s42mh.ap-northeast-2.rds.amazonaws.com',
    port: '3306',
    user: 'root',
    password: 'kky240101!',
    database: 'kkokiyodb'
});  

function convertDurationToSeconds(duration) {
  const durationObj = iso8601.parse(duration);
  return (
    durationObj.years * 31536000 +
    durationObj.months * 2592000 +
    durationObj.days * 86400 +
    durationObj.hours * 3600 +
    durationObj.minutes * 60 +
    durationObj.seconds
  );
}

async function fetchVideosFromChannel(channelId) {
  try {
      // 오늘 날짜에서 하루 전 (어제) 날짜 계산
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      const formattedToday = today.toISOString().split('T')[0]; // YYYY-MM-DD 형식으로 변환
      const formattedYesterday = yesterday.toISOString().split('T')[0]; // YYYY-MM-DD 형식으로 변환

      // YouTube API 호출 (특정 채널에서 어제까지 업로드된 동영상 검색)
      const response = await youtube.search.list({
          key: youtube.YOUTUBE_API_KEY,
          channelId: channelId,
          part: 'snippet',
          maxResults: 50, // 한 번에 가져올 최대 결과 수
          order: 'date',
          publishedAfter: `${formattedYesterday}T23:59:59Z`,
          publishedBefore: `${formattedToday}T23:59:59Z`,
      });

      const videos = response.data.items;
      videos.forEach((video) => {
          const videoId = video.id.videoId;
          const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
          console.log(`제목: ${video.snippet.title}, 업로드 날짜: ${video.snippet.publishedAt}, URL: ${videoUrl}`);
      });
  } catch (error) {
      console.error('YouTube API 호출 중 오류 발생:', error);
  }
}

async function getVideoDetails(videoUrl) {
  try {
    // 동영상 ID 추출
    const urlParams = new URLSearchParams(new URL(videoUrl).search);
    const videoId = urlParams.get('v');

    if (!videoId) {
      throw new Error('유효하지 않은 유튜브 URL입니다.');
    }

    // YouTube Data API를 사용하여 동영상 정보 가져오기
    const response = await youtube.videos.list({
      part: 'snippet,contentDetails',
      id: videoId,
    });

    const video = response.data.items[0];
    if (!video) {
      throw new Error('동영상을 찾을 수 없습니다.');
    }

    const { title, thumbnails, channelId } = video.snippet;
    const duration = video.contentDetails.duration;
    const durationInSeconds = convertDurationToSeconds(duration);

    // 채널 프로필 이미지 가져오기
    const channelResponse = await youtube.channels.list({
      part: 'snippet',
      id: channelId,
    });

    const channel = channelResponse.data.items[0];
    const profileImageUrl = channel.snippet.thumbnails.default.url;
    const channelTitle = channel.snippet.title;

    console.log(`제목: ${title},durationInSeconds : ${durationInSeconds}  thumbnailUrl: ${thumbnails.high.url} channelTitle: ${channelTitle}` )
    return {
      title,
      durationInSeconds,
      thumbnailUrl: thumbnails.high.url,
      profileImageUrl,
      channelTitle,
      channelId,
    };
  } catch (error) {
    console.error('오류 발생:', error.message);
    return null;
  }
}

//fetchVideosFromChannel('UCQ2a9oTOgf1P5y32uiS-whQ');

getVideoDetails('https://www.youtube.com/watch?v=Iqsv6VkoohU');

/* 예시 URL (테스트할 동영상 URL로 변경 가능)
uid = 37;
const v_id = 'jw1gxrzRgeU';
const vi = 'https://www.youtube.com/watch?v=';
const videoUrl = vi + v_id;

getVideoDetails(videoUrl).then(details => {
  if (details) {
    console.log('동영상 제목:', details.title);
    console.log('더보기란 내용:', details.description);
    console.log('영상 재생 시간 (초):', details.durationInSeconds);
    console.log('썸네일 이미지 URL:', details.thumbnailUrl);
    console.log('프로필 이미지 URL:', details.profileImageUrl);
    console.log('채널명:', details.channelTitle);
    console.log('채널id:', details.channelId);

    // 데이터베이스 연결
    connection.connect(err => {
      if (err) {
        console.error('Error connecting to the database:', err);
        return;
      }
      console.log('Connected to the database');
    });


    // 업데이트 쿼리
    const updateQuery = `UPDATE content SET thumnail_url  = '` + details.thumbnailUrl
                        + `', profile_url  = '` + details.profileImageUrl
                        +  `', channel_name  = '` + details.channelTitle
                        + `', channel_id = '` + details.channelId
                        + `'where id = ` + uid ;

      console.log(updateQuery);
      connection.query(updateQuery, (err, results) => {
        if (err) {
          console.error('Error executing the update query:', err);
          return;
        }
        console.log('Update query executed successfully', results);
      });

      connection.end(err => {
        if(err) {
          console.error('error');
        }
        console.log('disconnect');
        process.exit(0);
      })
  }
});   */
