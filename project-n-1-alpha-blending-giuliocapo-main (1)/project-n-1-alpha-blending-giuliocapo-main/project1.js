// bgImg is the background image to be modified.
// fgImg is the foreground image.
// fgOpac is the opacity of the foreground image.
// fgPos is the position of the foreground image in pixels. It can be negative and (0,0) means the top-left pixels of the foreground and background are aligned.
function composite( bgImg, fgImg, fgOpac, fgPos )
{

    // Loop within the limits of the fgImg
    for(var i = 0; i < fgImg.height; i += 1) {
        for(var j = 0; j < fgImg.width; j += 1) {


            // Calculate the index of the current pixel in the foreground image. I have done like this because the data array typically got consecutive RGBA channels so data will have W * H * 4 elements.
            var fgIndex = (i * fgImg.width + j) * 4;

            var bgIndex = fgIndexIsInTheFrame(i,j, fgPos, bgImg);

            // If the pixel is not transparent
            if(bgIndex !== undefined && fgImg.data[fgIndex + 3] !== 0) {
                // Normalization of alpha number to get norma = 1
                var alphaVal = fgImg.data[fgIndex + 3] / 255;

                // Apply alpha blending formula for each color channel (RGBA)
                // R
                bgImg.data[bgIndex] = fgImg.data[fgIndex] * (fgOpac * alphaVal) + (1 - (fgOpac * alphaVal)) * bgImg.data[bgIndex];
                // G
                bgImg.data[bgIndex + 1] = fgImg.data[fgIndex + 1] * (fgOpac * alphaVal) + (1 - (fgOpac * alphaVal)) * bgImg.data[bgIndex + 1];
                // B
                bgImg.data[bgIndex + 2] = fgImg.data[fgIndex + 2] * (fgOpac * alphaVal) + (1 - (fgOpac * alphaVal)) * bgImg.data[bgIndex + 2];
                // A
                bgImg.data[bgIndex + 3] = fgImg.data[fgIndex + 3] * (fgOpac * alphaVal) + (1 - (fgOpac * alphaVal)) * bgImg.data[bgIndex + 3];
            }
        }
    }
}

function fgIndexIsInTheFrame(i,j, fgPos, bgImg) {

    var posX = j + fgPos.x;
    var posY = i + fgPos.y;

    //verify if the pixel position is in the bgImg
    if (posX >= 0 && posX < bgImg.width && posY >= 0 && posY < bgImg.height) {

        // Calculate the index of the corresponding pixel in the background image unless we don't do alpha blending
        return (posY * bgImg.width + posX) * 4;

    }
    return undefined;
}