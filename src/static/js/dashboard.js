$(document).ready(function() {
    // show the alert
    setTimeout(function() {
        $(".alert").alert('close');
    }, 2000);

    const params = new URLSearchParams(window.location.search)

    status = params.get('status')

    if (status == 'added' || status == 'deleted') {
        window.location.href =  window.location.href.split("?")[0];  
    }
});

//triggered when modal is about to be shown

$(Document).on("click", ".open-PostDeleteDialog", function(e) {

    var postId = $(this).data('id');
    a = document.getElementById("delete");
    //get data-id attribute of the clicked element
    
    a.setAttribute("action", (postId));
    //populate the textbox
    

});


$(function () {
    'use strict'
  
    $('[data-toggle="offcanvas"]').on('click', function () {
      $('.offcanvas-collapse').toggleClass('open')
    })
  });
