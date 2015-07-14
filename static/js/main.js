function init()
{
    // init gray value slider
    GenericSlider.initSlider(
        slider = $( "#gray-slider" ),
        sliderInputs = $('input.gray'),
        1,
        255,
        1,
        255,
        function(values) {
            minGray = values[0] / 255;   
            maxGray = values[1] / 255;
            drawVolume(); 
        }
    );

    // init opacity value slider
    GenericSlider.initSlider(
        slider = $( "#opacity-slider" ),
        sliderInputs = $('#opacity-input'),
        0,
        255,
        255,
        255,
        function(values) {
            opacityVal = values[0] / 255;   
            drawVolume(); 
        }
    );

    // init gray value slider
    GenericSlider.initSlider(
        slider = $( "#color-slider" ),
        sliderInputs = $('color-input'),
        0,
        255,
        255,
        255,
        function(values) {
            colorVal = values[0] / 255;   
            drawVolume(); 
        }
    );



}