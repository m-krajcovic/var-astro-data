Running this should be as simple as running this:
```bash
docker-compose up -d
```
It will start two containers, one for the webapp with the sources of this repo and other for mysql.

The container with database will initialize all the tables with some data itself. 
Initializing database from the `init_db.sql` can take few seconds or minutes, so check the logs on the mysql container if there are issues.

If needed, you can do it manually from inside the mysql docker container with
```bash
mysql -uroot -proot test < docker-entrypoint-initdb.d/init_db.sql
```

If it still doesn't work, you can try building your own images and repeat the first step

```bash
gradlew stage
docker build -t mkrajcovic/var-astro-webapp -f Dockerfile .
docker build -t mkrajcovic/var-astro-mysql -f Dockerfile.db .
```
