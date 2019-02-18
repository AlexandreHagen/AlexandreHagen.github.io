$(function() {
	$('.carousel').slick({
		dots: false,
		centerMode: true,
		adaptiveHeight: false,
		variableWidth: true,
		infinite: true,
		speed: 600,
		slidesToShow: 3,
		slidesToScroll: 1,
		autoplay: true,
		autoplaySpeed: 5000,
		responsive: [
		{
			breakpoint: 1024,
			settings: {
				slidesToShow: 1,
				slidesToScroll: 1,
				infinite: true,
				dots: false,
				prevArrow: false,
    			nextArrow: false,
			}
		},
		{
			breakpoint: 600,
			settings: {
				slidesToShow: 1,
				slidesToScroll: 1,
				prevArrow: false,
    			nextArrow: false,
			}
		},
		{
			breakpoint: 480,
			settings: {
				slidesToShow: 1,
				slidesToScroll: 1,
				prevArrow: false,
    			nextArrow: false,
			}
		}
	    ]
	});
});