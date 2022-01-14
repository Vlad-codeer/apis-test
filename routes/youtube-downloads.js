const request = require('request');
const isUrlYoutube = (url) => {
  var valid = url.startsWith('https://youtu.be/');

  return valid;
};

const format_url = (url) => {
  var id = url.split('/')[url.split('/').length - 1];
  var format = `https://m.youtube.com/watch?v=${id}&feature=youtu.be`;
  return format;
};

function youtube_download(req, res, apikey) {
 var ApiKey = req.query.apikey;
  var url = req.query.url;
  if (!ApiKey) return res.send({
    status: false,
    message: 'apikey not defined'
  });
  if (ApiKey != apikey) return res.send({
    status: false,
    message: 'invalid apikey'
  });
  if (!url) return res.send({
    status: false,
    message: 'url is not defined'
  });
  
  const search = (uri) => {
  if (!isUrlYoutube(uri)) return res.send({
    status: false,
    ivalid_url: uri,
    message: 'this url not is of youtube'
  });
  
  request(format_url(uri), (err, req, body) => {
    if (err) return console.log(err);
    try {
      var regex = /var ytInitialPlayerResponse = {"responseContext":{"(.+)}}}};/gi;
      var json = JSON.parse(body.match(regex)[0].split('var ytInitialPlayerResponse = ').join('').split(';').join(''));
      var audio = [];
      for (let i of json.streamingData.adaptiveFormats) {
        if (i.mimeType == 'audio/webm codecs="opus"' && i.audioQuality == 'AUDIO_QUALITY_MEDIUM') {
          audio.push(i.url);
        }
      }

      var object = {
        videoId: json.videoDetails.videoId,
        title: json.videoDetails.title,
        durarion: json.microformat.playerMicroformatRenderer.lengthSeconds,
        views: parseInt(json.microformat.playerMicroformatRenderer.viewCount),
        publication: json.microformat.playerMicroformatRenderer.publishDate,
        description: {
          text: json.microformat.playerMicroformatRenderer.description.simpleText
        },
        download: {
          audio: {
            url: audio[0]
          },
          video: {
            url: json.streamingData.formats[0].url
          }
        },
        channel: {
          name: json.microformat.playerMicroformatRenderer.ownerChannelName,
          url: `https://youtube.com/channel/${json.microformat.playerMicroformatRenderer.externalChannelId}`,
          category: json.microformat.playerMicroformatRenderer.category
        }
      };
      res.send({
        status: true,
        result: [object]
      });
    } catch (err) {
      res.send({
        status: 404,
        message: 'video not found'
      });
    }
  });
  };
  search(url);
}

module.exports = { youtube_download };