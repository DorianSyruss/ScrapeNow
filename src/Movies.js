'use strict';

import $ from 'jquery';
import { baseUrl } from './config';
import urlJoin from 'url-join';

function getText($context, selector) {
  return $context.find(selector).text().trim();
}
function getAttribute($context, selector, attr) {
  return $context.find(selector).attr(attr);
}

function parseMovie($row) {
  let title = getText($row, '.lister-item-header a');
  let url = getAttribute($row, 'td.title > a', 'href');
  let rating = parseFloat(getText($row, '.ratings-bar strong').split('/')[0]) || undefined;
  let metascore = parseFloat(getText($row, '.ratings-metascore span').split('/')[0]) || undefined;
  let runtime = parseFloat(getText($row, '.text-muted .runtime').split('/')[0]) || undefined;
  let desc = getText($row, 'span.outline');
  let imgUrl = getAttribute($row, '.lister-item-image img', 'loadlate');
  let genre = getText($row, '.text-muted .genre');


  return { title, url, rating, metascore, runtime, desc, imgUrl, genre };
}

function renderMovie($output, movie) {
  let html = `
    <a href="${ urlJoin(baseUrl, movie.url) }" target="_blank" class="movie list-group-item">
      <div class="title"><span>${movie.title}</span></div> 
      <img src="${movie.imgUrl}" alt="">
      <span class = "content-right">
        <ul class="movie-details">
          <li class="rating">${movie.rating || "not rated" }<span class="glyphicon glyphicon-star"></span></li> 
          <li class="metascore">${movie.metascore || "not rated" }<span> Metascore</span></li>
          <li class="runtime">${movie.runtime + " min" || "x: min"}</>
          <li class="genre">${movie.genre}</li>
        </ul>
          <div class="desc">${movie.desc}</div>
      </span>
    </a>`;
  $output.append(html);
}

function parseMovies(doc) {
  let $rows = $(doc).find('#main .article .lister-item');
  return $rows.map((_, el) => parseMovie($(el))).get();
}

module.exports = { parseMovies, renderMovie };
