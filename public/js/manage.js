/* Bus Management page
   jQuery uses (5 different ones are marked below):
   1. Event handling       .on()
   2. Reading form values  .val()
   3. Changing DOM content .empty() / .append() / .text()
   4. Effects              .fadeIn() / .fadeOut()
   5. Looping              $.each() / .data()
   Ajax: $.getJSON (GET) and $.ajax (POST / PUT / DELETE) exchange JSON with the REST API.
*/
const API = '/api/buses';
const FIELDS = ['Bus_ID', 'Bus_Name', 'Route', 'Departure', 'Destination', 'Travel_Date',
                'Departure_Time', 'Arrival_Time', 'Total_Seats', 'Available_Seats', 'Fare'];

let editingId = null;      // null = adding a new bus, otherwise the Bus_ID being edited
let deleteId = null;

const busModal = new bootstrap.Modal('#busModal');
const scheduleModal = new bootstrap.Modal('#scheduleModal');
const deleteModal = new bootstrap.Modal('#deleteModal');

/* ---------- helpers ---------- */
function showMessage(text, kind) {
  $('#message').html($('<div>').addClass('alert alert-' + kind).text(text)).hide().fadeIn(200);  // use 4
  setTimeout(function () { $('#message .alert').fadeOut(400); }, 3500);
}

function errorText(xhr) {
  return (xhr.responseJSON && xhr.responseJSON.error) || 'Could not reach the server.';
}

// Generic JSON request helper (Ajax: sends JSON, expects JSON back)
function sendJSON(method, url, data) {
  return $.ajax({
    url: url,
    method: method,
    contentType: 'application/json',
    data: data ? JSON.stringify(data) : undefined,
    dataType: 'json'
  });
}

/* ---------- table ---------- */
function renderTable(buses) {
  const $body = $('#busTable').empty();                                   // use 3

  if (!buses.length) {
    $body.append('<tr><td colspan="9" class="empty-note">No buses yet. Use "Add bus" to create one.</td></tr>');
    return;
  }

  $.each(buses, function (i, b) {                                         // use 5: $.each
    const $row = $('<tr>');
    $.each([b.Bus_ID, b.Bus_Name, b.Route, b.Travel_Date, b.Departure_Time, b.Arrival_Time,
            b.Available_Seats + ' / ' + b.Total_Seats], function (j, value) {
      $row.append($('<td>').text(value));
    });
    $row.append($('<td>').addClass('text-end').text(Number(b.Fare).toFixed(2)));

    const $actions = $('<td>').addClass('text-end text-nowrap');
    $actions.append($('<button>').addClass('btn btn-sm btn-outline-primary me-1 edit-btn')
      .data('bus', b).text('Edit'));                                      // use 5: .data
    $actions.append($('<button>').addClass('btn btn-sm btn-outline-secondary me-1 schedule-btn')
      .data('bus', b).text('Schedule'));
    $actions.append($('<button>').addClass('btn btn-sm btn-outline-danger delete-btn')
      .data('id', b.Bus_ID).text('Delete'));
    $row.append($actions);
    $body.append($row);
  });
}

function loadAll() {
  $.getJSON(API)                                                          // GET all buses
    .done(renderTable)
    .fail(function (xhr) { showMessage(errorText(xhr), 'danger'); });
}

/* ---------- add / edit ---------- */
function openBusForm(bus) {
  $('#formError').empty();
  $('#busForm')[0].reset();
  editingId = bus ? bus.Bus_ID : null;
  $('#busModalTitle').text(bus ? 'Edit bus ' + bus.Bus_ID : 'Add bus');
  $('#Bus_ID').prop('readonly', !!bus);          // Bus_ID cannot change once created
  if (bus) $.each(FIELDS, function (i, f) { $('#' + f).val(bus[f]); });   // use 2 (set values)
  busModal.show();
}

function readBusForm() {
  const data = {};
  $.each(FIELDS, function (i, f) { data[f] = $.trim($('#' + f).val()); });  // use 2: val
  ['Total_Seats', 'Available_Seats', 'Fare'].forEach(function (f) { data[f] = Number(data[f]); });
  return data;
}

/* ---------- events (use 1) ---------- */
$(function () {
  loadAll();

  $('#addBtn').on('click', function () { openBusForm(null); });
  $('#showAllBtn').on('click', function () { $('#findId').val(''); loadAll(); });

  $('#findBtn').on('click', function () {
    const id = $.trim($('#findId').val());
    if (!id) return showMessage('Enter a Bus ID to find.', 'warning');
    $.getJSON(API + '/' + encodeURIComponent(id))                          // GET one bus
      .done(function (bus) { renderTable([bus]); })
      .fail(function (xhr) { renderTable([]); showMessage(errorText(xhr), 'warning'); });
  });

  // Delegated handlers: the buttons are created dynamically after the page loads
  $('#busTable').on('click', '.edit-btn', function () { openBusForm($(this).data('bus')); });

  $('#busTable').on('click', '.schedule-btn', function () {
    const b = $(this).data('bus');
    $('#scheduleError').empty();
    $('#scheduleModalTitle').text('Update schedule: ' + b.Bus_ID);
    $('#sch_Bus_ID').val(b.Bus_ID);
    $('#sch_Travel_Date').val(b.Travel_Date);
    $('#sch_Departure_Time').val(b.Departure_Time);
    $('#sch_Arrival_Time').val(b.Arrival_Time);
    scheduleModal.show();
  });

  $('#busTable').on('click', '.delete-btn', function () {
    deleteId = $(this).data('id');
    $('#deleteIdLabel').text(deleteId);
    deleteModal.show();
  });

  // Save (POST for new, PUT for existing)
  $('#busForm').on('submit', function (e) {
    e.preventDefault();
    const data = readBusForm();
    const request = editingId
      ? sendJSON('PUT', API + '/' + encodeURIComponent(editingId), data)
      : sendJSON('POST', API, data);

    request
      .done(function () {
        busModal.hide();
        showMessage(editingId ? 'Bus updated.' : 'Bus added.', 'success');
        loadAll();
      })
      .fail(function (xhr) {
        $('#formError').html($('<div>').addClass('alert alert-danger').text(errorText(xhr)));
      });
  });

  // Update schedule (PUT)
  $('#scheduleForm').on('submit', function (e) {
    e.preventDefault();
    const id = $('#sch_Bus_ID').val();
    sendJSON('PUT', API + '/' + encodeURIComponent(id) + '/schedule', {
      Travel_Date: $('#sch_Travel_Date').val(),
      Departure_Time: $('#sch_Departure_Time').val(),
      Arrival_Time: $('#sch_Arrival_Time').val()
    })
      .done(function () { scheduleModal.hide(); showMessage('Schedule updated.', 'success'); loadAll(); })
      .fail(function (xhr) {
        $('#scheduleError').html($('<div>').addClass('alert alert-danger').text(errorText(xhr)));
      });
  });

  // Delete (DELETE)
  $('#confirmDeleteBtn').on('click', function () {
    sendJSON('DELETE', API + '/' + encodeURIComponent(deleteId))
      .done(function () { deleteModal.hide(); showMessage('Bus deleted.', 'success'); loadAll(); })
      .fail(function (xhr) { deleteModal.hide(); showMessage(errorText(xhr), 'danger'); });
  });
});
