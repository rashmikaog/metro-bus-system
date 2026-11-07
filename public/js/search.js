/* Bus Search page
   jQuery uses (5 different ones are marked below):
   1. Event handling       .on()
   2. Reading form values  .val()
   3. Changing DOM content .empty() / .append()
   4. Show/hide + effects  .toggle() / .fadeIn() / .slideDown()
   5. Class + property     .addClass() / .removeClass() / .prop() / .attr()
   Ajax: $.getJSON() fetches JSON from the REST API.
*/
const API = '/api/buses';

const LABELS = {
  available:   { text: 'Optional filter (destination)', placeholder: 'e.g. Kandy', type: 'text' },
  route:       { text: 'Route',                          placeholder: 'e.g. Colombo - Galle', type: 'text' },
  departure:   { text: 'Departure location',             placeholder: 'e.g. Colombo Fort', type: 'text' },
  destination: { text: 'Destination',                    placeholder: 'e.g. Makubura', type: 'text' },
  date:        { text: 'Travel date',                    placeholder: '', type: 'date' }
};

function showMessage(text, kind) {
  $('#message').html(
    $('<div>').addClass('alert alert-' + kind).text(text)            // jQuery use 5: addClass
  ).hide().fadeIn(200);                                                // jQuery use 4: effect
}

function renderBuses(buses) {
  const $body = $('#results').empty();                                // jQuery use 3: empty
  $('#message').empty();

  if (!buses.length) {
    $body.append('<tr><td colspan="8" class="empty-note">No buses match this search.</td></tr>');
    $('#resultCount').text('0 buses found');
    return;
  }

  buses.forEach(function (b) {
    const seatClass = b.Available_Seats === 0 ? 'bg-danger'
                    : b.Available_Seats <= 10 ? 'bg-warning text-dark' : 'bg-success';
    const $row = $('<tr>');
    // .text() keeps user data safe (no HTML injection)
    $row.append($('<td>').text(b.Bus_ID));
    $row.append($('<td>').text(b.Bus_Name));
    $row.append($('<td>').text(b.Route));
    $row.append($('<td>').text(b.Travel_Date));
    $row.append($('<td>').text(b.Departure_Time));
    $row.append($('<td>').text(b.Arrival_Time));
    $row.append($('<td>').append(
      $('<span>').addClass('badge seat-badge ' + seatClass)
        .text(b.Available_Seats + ' / ' + b.Total_Seats)));
    $row.append($('<td>').addClass('text-end').text(Number(b.Fare).toFixed(2)));
    $body.append($row);                                               // jQuery use 3: append
  });

  $('#resultCount').text(buses.length + (buses.length === 1 ? ' bus found' : ' buses found'));
  $body.hide().slideDown(250);                                        // jQuery use 4: slideDown
}

function runSearch() {
  const type = $('#searchType').val();                                // jQuery use 2: val
  const term = $.trim($('#searchTerm').val());

  let url;
  if (type === 'available') {
    url = API + '/search/available' + (term ? '?destination=' + encodeURIComponent(term) : '');
  } else {
    if (!term) { showMessage('Enter a value to search.', 'warning'); return; }
    url = API + '/search/' + type + '/' + encodeURIComponent(term);
  }

  $('#searchForm button[type=submit]').prop('disabled', true);        // jQuery use 5: prop

  $.getJSON(url)                                                      // Ajax GET (JSON)
    .done(renderBuses)
    .fail(function () { showMessage('Could not reach the server. Is it running?', 'danger'); })
    .always(function () { $('#searchForm button[type=submit]').prop('disabled', false); });
}

$(function () {
  // jQuery use 1: event handling
  $('#searchType').on('change', function () {
    const cfg = LABELS[$(this).val()];
    $('#termLabel').text(cfg.text);
    $('#searchTerm').attr({ type: cfg.type, placeholder: cfg.placeholder }).val('');   // use 5: attr
    $('#searchTerm').toggle(true);                                                     // use 4: toggle
  });

  $('#searchForm').on('submit', function (e) { e.preventDefault(); runSearch(); });

  $('#clearBtn').on('click', function () {
    $('#searchType').val('available').trigger('change');
    runSearch();
  });

  runSearch();   // show available buses on first load
});
