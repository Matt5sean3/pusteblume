var args = arguments[0] || {};

function ImageDisplay(args, window, container, imageView, closeButton)
{
    this.container = container;
    this.image = imageView;
    this.closeButton = closeButton;
    this.window = window;
    if(args.url)
    {
      this.image.image = args.url;
    }
    else
    {
        this.close();
    }
    this.image.addEventListener("click", this.close.bind(this));
    this.closeButton.addEventListener("click", this.close.bind(this));
    this.window.open();
}

ImageDisplay.prototype.setUrl = function()
{
    this.image.addEventListener();
};

ImageDisplay.prototype.close = function()
{
    this.window.close();
};

var display = new ImageDisplay(args, $.window, $.display_image, $.img_big, $.btn_close);
