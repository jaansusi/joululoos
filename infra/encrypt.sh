ID_CODE=$1
NAME=$2
GIFTING_TO=$3

FILE=./cdoc/$NAME.txt

echo "testestestest"

touch $FILE
echo $GIFTING_TO >> $FILE
java -jar /shared/cdoc/target/cdoc.jar $FILE $ID_CODE -o ./public/cdoc_files/$NAME.cdoc

rm -f $FILE