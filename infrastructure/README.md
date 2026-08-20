# Authentication

Run `aws configure sso` the first time a user is logging in.

Once configured, use `aws sso login --profile admin` to log in.

Requires:

- AWS CLI
- A start URL created in AWS Management Console
- A user with the admin role/profile.

# Apply terraform config

Run `terraform apply`.

# Destroy resources

Run `terraform destroy`.

## Notes

To go to the neo4j DB, go to AWS EC2 and click connect.

List docker containers with `docker ps`.

To enter a docker container run:

- `docker exec -it <container_id> /bin/bash`

In order to mount attached EBS volume automatically to /data, add the following to /etc/fstab:

`/dev/nvme1n1 /mnt/neo4j ext4 defaults 0 0`

<EBS volume device name> <mount path> <file system type> <mount options> <dump frequency> <fsck order>

## Install plugins

APOC:

- Move the apoc plugin from /labs to /plugins

Neo4j Graph Data Science plugin:

- Navigate to /plugins
- Run `sudo curl -L -O https://graphdatascience.ninja/neo4j-graph-data-science-2.4.0.zip`
- `sudo yum install unzip`
- `sudo unzip neo4j-graph-data-science-2.4.0.zip`
- Add `gds.*` to `dbms.security.procedures.unrestricted` in `neo4j.conf`
- Restart the Docker container

# Scheduled imports on this box (import-runner)

The recurring data jobs (monthly brreg roles refresh) and the yearly shareholder
import run on this EC2 box instead of a laptop — local bolt to Neo4j, no caffeinate.
Setup:

1. Clone the repo to `~/aksjegrafen` (first time only).
2. Run `~/aksjegrafen/infrastructure/import-runner/setup.sh` (installs Node 22, builds
   the server, installs the crontab from `import-runner/crontab.txt`).
3. Create `~/aksjegrafen/server/.env` — same variables as locally, with
   `NEO4J_URL=bolt://localhost:7687`.

Logs land in `~/aksjegrafen-logs/`. For the yearly import, copy the CSV to
`~/aksjegrafen/data/aksjeeiebok__<year>.csv` (e.g. from S3) and run
`cd ~/aksjegrafen/server && npm run import -- <year>` in tmux/screen. The import is
additive per year by default; `--clearGraphDBFirst` is the only destructive path.
