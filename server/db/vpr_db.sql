
CREATE DATABASE `vpr_db`

USE `vpr_db`;

DROP TABLE IF EXISTS `files`;

CREATE TABLE `files` (
  `errMsg` varchar(100) NOT NULL DEFAULT '',
  `serverId` varchar(100) NOT NULL DEFAULT '',
  `score` varchar(10) NOT NULL DEFAULT '',
  `addtime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `lasttime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`serverId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


/*Table structure for table `user` */
DROP TABLE IF EXISTS `user`;

CREATE TABLE `user` (
  `userID` varchar(100) NOT NULL DEFAULT '',
  `nickName` varchar(100) NOT NULL DEFAULT '',
  `groupid` varchar(10) NOT NULL DEFAULT '',
  `logins` int(100) DEFAULT '0',
  `wechatID` varchar(100) NOT NULL DEFAULT '',
  `addtime` timestamp NULL DEFAULT NULL,
  `lasttime` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `scored` int(10) NOT NULL DEFAULT '0',
  `path` varchar(100) NOT NULL DEFAULT '',
  PRIMARY KEY (`userID`,`groupid`,`wechatID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
