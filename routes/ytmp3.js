const request = require('request');

function ytmp3(req, res, apikey) {
  var ApiKey = req.query.apikey;
  var text = req.query.text;
  if (!ApiKey) return res.send({
    status: false,
    message: 'apikey not defined'
  });
  if (ApiKey != apikey) return res.send({
    status: false,
    message: 'invalid apikey'
  });
  if (!text) return res.send({
    status: false,
    message: 'text is not defined'
  });
  const start = (word) => {
    var normalize = word.split('').join('+').split('%20').join('+');
    var search = normalize.normalize('NFD').replace(/[\u0300-\u036f]/gi, '');
    var url = `https://www.youtube.com/results?app=desktop&sp=mAEA&search_query=${search}`;
    var datas = [];

    request(url, (err, req, body) => {
      if (err) return console.log(err);
      var regExp = /= \{\"responseContext\":\{(.+?);/g;
      var data = JSON.parse(body.match(regExp)[0].split('= ').join('').split(';').join(''));

      var video;
      var ids = [];
      var thumbnails = {
        videoThumb: [],
        channelThumb: []
      };
      for (let i of data.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents) {
        if (Object.keys(i) == 'videoRenderer') {
          ids.push(i.videoRenderer.videoId);
          video = 'https://youtu.be/' + ids[0];
          thumbnails.videoThumb.push(i.videoRenderer.thumbnail.thumbnails[0]);
          thumbnails.channelThumb.push(i.videoRenderer.channelThumbnailSupportedRenderers.channelThumbnailWithLinkRenderer.thumbnail.thumbnails[0]);
        }
      }
      datas.push({
        video: thumbnails.videoThumb[0].url.split('?')[0],
        channel: thumbnails.channelThumb[0].url.split('=')[0]
      });
      request(format_url(video), (erri, reqi, bodi) => {
        if (err) return console.log(erri);
        var regex = /var ytInitialPlayerResponse = {"responseContext":{"(.+)}}}};/gi;
        var json = JSON.parse(bodi.match(regex)[0].split('var ytInitialPlayerResponse = ').join('').split(';').join(''));

        var audio = [];
        for (let x of json.streamingData.adaptiveFormats) {
          if (x.mimeType.startsWith('audio/webm codecs="opus"')) {
            if (x.hasOwnProperty('url')) {
              audio.push(x.url);
            } else if (!x.hasOwnProperty('url')) {
              audio.push('nothing found, use the search');
            }
          }
        }
        var object = {
          videoId: json.videoDetails.videoId,
          title: json.videoDetails.title,
          thumbnail: datas[0].video,
          durarion: json.microformat.playerMicroformatRenderer.lengthSeconds,
          audio: audio[0],
          views: parseInt(json.microformat.playerMicroformatRenderer.viewCount),
          publication: json.microformat.playerMicroformatRenderer.publishDate,
          description: {
            text: json.microformat.playerMicroformatRenderer.description.simpleText
          }
        };
        res.send({
          status: true,
          result: object
        });
      });
    });
  };
  start(text);
}

module.exports = { ytmp3 };