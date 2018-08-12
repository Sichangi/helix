const axios = require("axios").default;
const striptags = require("striptags");

/**
 * Search the wiki
 * @param {String} query
 * @param {Number} limit
 */
async function search(query, limit = 5) {
  const q = encodeURIComponent(query);

  return axios
    .get(
      `http://warframe.wikia.com/api/v1/Search/List?query=${q}&limit=${limit}`
    )
    .then(response => {
      const results = [];

      response.data.items.forEach(element => {
        results.push({
          title: element.title,
          url: element.url,
          description: striptags(element.snippet)
        });
      });

      return results;
    });
}

/**
 * Get details of a page
 * @param {String} query Page title
 */
async function getDetails(query) {
  const q = encodeURIComponent(query);
  let description = "";
  let id = "";

  return (
    axios
      // Search the wiki for the query
      .get(`http://warframe.wikia.com/api/v1/Search/List?query=${q}`)
      .then(response => {
        id = response.data.items[0].id;

        // Get the initial details of the first result
        return axios.get(
          `http://warframe.wikia.com/api/v1/Articles/AsSimpleJson?id=${id}`
        );
      })
      .then(response => {
        if (response.data.sections[0].content[0]) {
          description = response.data.sections[0].content[0].text;
        }

        // Get the remaining details of the first result
        return axios.get(
          `http://warframe.wikia.com/api/v1/Articles/Details?ids=${id})`
        );
      })
      .then(response => {
        const id = Object.keys(response.data.items)[0];
        const item = response.data.items[id];

        return {
          title: item.title,
          description,
          url: `http://warframe.wikia.com/${item.url}`,
          image_url: item.thumbnail.split("/window-crop/")[0]
        };
      })
  );
}

module.exports = { getDetails, search };
