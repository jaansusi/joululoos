ID_CODE=$1
NAME=$2
GIFTING_TO=$3

FILE=/shared/$NAME.txt

touch $FILE
echo $GIFTING_TO >> $FILE

curl -X POST infra-cdocweb-1:4444/cdoc -d /app/cdoc_files/$NAME.txt -d $ID_CODE -d $NAME

rm -f $FILE

cp $FILE.cdoc /usr/src/app/public/cdoc_files/$NAME.cdoc