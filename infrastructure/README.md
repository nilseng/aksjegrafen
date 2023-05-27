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

If the Docker run command does not work, move the apoc plugin manually from /labs to /plugins

To enter a docker container run:

- `docker exec -it <container_id> /bin/bash`

In order to mount attached EBS volume automatically to /data, add the following to /etc/fstab:

`/dev/nvme1n1 /mnt/neo4j ext4 defaults 0 0`

<EBS volume device name> <mount path> <file system type> <mount options> <dump frequency> <fsck order>
