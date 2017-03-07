'use strict';

require('./../style/main.scss');

import 'whatwg-fetch';
import $ from 'jquery';
import urlJoin from 'url-join';
import './errors';
import { parseMovies, renderMovie } from './Movies';
import { fetchDocument, parseYear } from './Utils';
import { proxyUrl, baseUrl } from './config';

const ENTER = 13;

// flash errors
const messages = {
  [Error.INVALID_INPUT]: 'Please enter a valid year',
  [Error.NO_INPUT]: 'Please enter a valid year',
  [Error.OUT_OF_RANGE]: 'Year is out of range ( 1950 - 2030 )',
  [Error.NO_RESULTS]: 'Oh Snap! No Queries Matched... Please try again!'
};

// ui elements
const $btnList = $('#btnList');
const $yearField = $('#yearField');
const $yearTitle = $('#yearTitle');
const $movieList = $('.movies');
const $loader = $('.loader');
const $flashMessage = $('.flash-message');

// wire-up event listeners
$btnList.click(() => listTopMovies(readYear()));
$yearField.keyup(e => {
  if (e.keyCode !== ENTER) return;
  listTopMovies(readYear());
});

function setDisabled($input, disabled=true) {
  $input.prop('disabled', disabled);
}

// initial rendering
$loader.fadeIn('medium');
listTopMovies((new Date()).getFullYear());


function readYear() {
  let year = $yearField.val();
  $yearField.val('');
  return year;
}

const flashMessage = err => messages[err.code || 'default'];

function listTopMovies(input) {
  setDisabled($yearField);
  let [ err, year ] = parseYear(input);

  // reset ui
  $movieList.empty();
  $flashMessage.hide();

  // show error on invalid input
  if (err) {
    $flashMessage
      .addClass('.error')
      .text(flashMessage(err))
      .slideDown('fast');

    setDisabled($yearField, false);
    return;
  }

  // update title
  $yearTitle.text(year);

  // fetch movies
  $loader.fadeIn('fast');
  fetchMovies(year)
    .then(movies => {
      $loader.fadeOut('fast');
      setDisabled($yearField, false);

      // update movie list
      if (movies.length !== 0) {
        movies.forEach(movie => renderMovie($movieList, movie));
        return;
      }

      // show error if no movies found
      $flashMessage
        .addClass('.error')
        .text(messages[Error.NO_RESULTS])
        .fadeIn('slow');
    });
}

function fetchMovies(year) {
  let url = urlJoin(proxyUrl, baseUrl, '/year/', year);
  return fetchDocument(url).then(doc => parseMovies(doc));
}


