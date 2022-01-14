const request = require('request');

function youtube(req, res, apikey) {
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
    const normalize = word.split(' ').join('+');
    const search = normalize.normalize('NFD').replace(/[\u0300-\u036f]/gi, '');

    const url = `https://www.youtube.com/results?app=desktop&sp=mAEA&search_query=${search}`;

    request(url, (err, req, body) => {
      if (err) return console.log(err);

      var regExp = /= \{\"responseContext\":\{.+?;/g;
      try {
        var data = JSON.parse(body.match(regExp)[0].split('= ').join('').split(';').join(''));

        var infos = data.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents;

        var videos;
        if (Object.keys(infos[0]) == 'channelRenderer') {
          videos = infos[2];
        } else if (Object.keys(infos[0]) == 'videoRenderer') {
          videos = infos[0];
        }

        var _data = videos.videoRenderer;

        var title = videos.videoRenderer.title.runs[0].text;

        var thumbnail = videos.videoRenderer.thumbnail.thumbnails[0].url;

        var duration = videos.videoRenderer.lengthText.simpleText;

        var views = videos.videoRenderer.viewCountText.simpleText.split(' visualizações').join('').split(',').join('.');

        var url_video = 'https://youtu.be' + _data.videoId;

        var name_channel = videos.videoRenderer.ownerText.runs[0].text;

        var url_channel = 'https://youtube.com' + videos.videoRenderer.ownerText.runs[0].navigationEndpoint.commandMetadata.webCommandMetadata.url;

        var url_perfil_channel = videos.videoRenderer.channelThumbnailSupportedRenderers.channelThumbnailWithLinkRenderer.thumbnail.thumbnails[0].url.split('=')[0];

        var TimePublished = _data.publishedTimeText.simpleText;

        var ownerId = _data.ownerText.runs[0].navigationEndpoint.browseEndpoint.browseId;

        var obj = {
          videoId: _data.videoId,
          title: title,
          source: url_video,
          thumbnail: thumbnail,
          views: views,
          duration: duration,
          channel: {
            channelId: ownerId,
            name: name_channel,
            source: url_channel,
            thumbnail: url_perfil_channel
          }
        };
        res.send({
          status: true,
          result: [obj]
        });
      } catch (err) {
        res.send({
          status: false,
          resultado: ['not found']
        });
      }
    });
  };
  start(text);
}

module.exports = { youtube };