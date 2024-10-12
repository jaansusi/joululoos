ID_CODE=$1
NAME=$2
GIFTING_TO=$3

FILE=./cdoc_files/$NAME.txt

echo "testestestest"

touch $FILE
echo $GIFTING_TO >> $FILE
java -jar ./infra/cdoc.jar $FILE $ID_CODE -o ./cdoc_files/$NAME.cdoc

rm -f $FILE