//
let footer = $('.modal-footer');
$('.toggle').click(function () {
  let toggle = $(this);
  $('.delete').click(function () {
    $('#deleteModal').on('hide.bs.modal', e => {
      e.preventDefault();
    });

    let text = 'Eliminando evento';
    let stopper = text + '...';
    let body = $('.modal-body');
    body.text(text);
    let loading = setInterval(() => {
      (body.text() === stopper)
        ? body.text(text)
        : body.append('.');
    }, 300);
    $.ajax({
      type: 'DELETE',
      url: toggle.data('href'),
      success: event => {
        clearInterval(loading);
        footer.empty();
        footer.html(`<a href="${event.redirect}" class="btn btn-success mr-auto text-white">Regresar a eventos`);
        body.text('Este evento ha sido eliminado');
        $('#deleteModal').on('hidden.bs.modal', () => {
          window.location.href = event.redirect;
        });
        $('#deleteModal').off('hide.bs.modal');
      },
      error: err => {
        console.log(err);
      },
    });
  });
});