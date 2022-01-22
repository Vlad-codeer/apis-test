const request = require('request');

const formatUrlYTB = (inputUrl) => {
  var outputUrl;
  if (inputUrl.startsWith('https://youtube.com/')) {
    var id = inputUrl.match(/\?v=(.+)/gi)[0].split('?v=')[1];
    outputUrl = `https://m.youtube.com/watch?v=${id}&feature=youtu.be`;
  } else if (inputUrl.startsWith('https://youtu.be/')) {
    var uid = inputUrl.split('/')[inputUrl.split('/').length - 1];
    outputUrl = `https://m.youtube.com/watch?v=${uid}&feature=youtu.be`;
  }
  return outputUrl;
};

const formatDate = (date) => {
  var split = date.split('-');
  return split[split.length - 1] + '/' + split[1] + '/' + split[0];
};

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
  const search = (word) => {
    var url = `https://m.youtube.com/results?sp=mAEA&search_query=${word}`;

    request(url, (err, req, body) => {
      if (err) return console.log(err);
      var regex = /var ytInitialData = {"responseContext":(.+?)};/gi;
      var data = JSON.parse(body.match(regex)[0].split('var ytInitialData = ').join('').split(';').join(''));

      var results = [];
      for (let i of data.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents) {
        if (Object.keys(i)[0] == 'videoRenderer') {
          var info = i.videoRenderer;

          results.push({
            title: info.title.runs[0].text,
            source: 'https://youtu.be/' + info.videoId,
            views: info.viewCountText.simpleText.split(' visualizações').join(''),
            thumbnail: info.thumbnail.thumbnails[0].url.split('?')[0],
            publication: '',
            duration: info.lengthText.simpleText,
            channel: [{
              title: info.ownerText.runs[0].text,
              source: 'https://youtube.com/channel/' + info.ownerText.runs[0].navigationEndpoint.browseEndpoint.browseId,
              thumbnail: info.channelThumbnailSupportedRenderers.channelThumbnailWithLinkRenderer.thumbnail.thumbnails[0].url.split('=')[0],
              description: {
                text: ''
              }
            }]
          });
        }
      }

      request(formatUrlYTB(results[0].source), (err, req, body) => {
        if (err) return console.log(err);
        var regex = /var ytInitialPlayerResponse = {"responseContext":{"(.+)}}}};/gi;
        var json = JSON.parse(body.match(regex)[0].split('var ytInitialPlayerResponse = ').join('').split(';').join(''));

        results[0].publication = formatDate(json.microformat.playerMicroformatRenderer.publishDate);

        results[0].channel[0].description.text = json.microformat.playerMicroformatRenderer.description.simpleText;

        res.json({
          status: true,
          result: results[0]
        });
      });
    });
  };
  search(text);
}

module.exports = { youtube };