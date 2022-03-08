- add video and run ./list.sh
- video whose width > 1920 cause high CPU, run this to rescale(to 1920*X):

*ffmpeg -i mylivewallpapers.com-Samurai-Girl-Blade-4K.mp4 -filter:v scale=1920:-1 -c:a copy mylivewallpapers.com-Samurai-Girl-Blade-4K_1.mp4*



 
