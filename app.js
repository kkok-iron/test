const axios = require('axios');
const cheerio = require('cheerio');

async function crawlYouTubeVideos(keyword) {
    try {
        const response = await axios.get(`https://www.youtube.com/results?search_query=${encodeURIComponent(keyword)}`);
        const $ = cheerio.load(response.data);

        const videos = [];
        $('a#video-title').each((index, element) => {
            const title = $(element).text().trim();
            const url = 'https://www.youtube.com' + $(element).attr('href');
            videos.push({ title, url });
        });

        return videos;
    } catch (error) {
        console.error('Error:', error);
    }
}
crawlYouTubeVideos('programming').then(videos => {
    console.log('Videos:', videos);
});