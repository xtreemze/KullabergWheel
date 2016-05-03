(function ($) {
	$(function () {

		$('.button-collapse').sideNav({
			menuWidth: 250, // Default is 240
			edge: 'left', // Choose the horizontal origin
			closeOnClick: true // Closes side-nav on <a> clicks, useful for Angular/Meteor
		});
		$('select').material_select();
	}); // end of document ready
})(jQuery); // end of jQuery name space
