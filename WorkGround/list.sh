#!sh

ls *.mp4 > data.txt

for d in $(ls *.mp4)
do 
echo $d; 
ffmpeg -itsoffset -1 -i $d -vcodec mjpeg -vframes 1 -an -f rawvideo -s 200x150 ./assests/thumbnails/$d.jpg -y
done