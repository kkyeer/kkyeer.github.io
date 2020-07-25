# NAS

##　SAMBA

```shell
sudo mount -t cifs //192.168.50.150/download /mnt/download -o username=kkyeer,sec=ntlmssp,iocharset=utf8,uid=0,gid=0
```