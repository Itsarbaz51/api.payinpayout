-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 18, 2025 at 01:43 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `pay`
--

-- --------------------------------------------------------

--
-- Table structure for table `api_keys`
--

CREATE TABLE `api_keys` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `key` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `expiresAt` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) DEFAULT NULL,
  `action` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `ipAddress` varchar(191) DEFAULT NULL,
  `userAgent` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `userId`, `action`, `description`, `ipAddress`, `userAgent`, `createdAt`) VALUES
('cmfdpz7u50001v4pknvh66lhu', 'cmfdous790000v4qkqknh9lyp', 'USER_LOGIN', 'ADMIN logged in: admin@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-09-10 08:30:38.957'),
('cmfdq87k10007v4pkefxgsg02', 'cmfdous790000v4qkqknh9lyp', 'USER_LOGIN', 'ADMIN logged in: admin@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36', '2025-09-10 08:37:38.497'),
('cmfdvqcam0001v45sv0z0y9yv', 'cmfdous790000v4qkqknh9lyp', 'USER_LOGIN', 'ADMIN logged in: admin@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36', '2025-09-10 11:11:42.522'),
('cmfdvr9a10003v45s51vjgcta', 'cmfdous790000v4qkqknh9lyp', 'USER_LOGIN', 'ADMIN logged in: admin@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36', '2025-09-10 11:12:25.274'),
('cmfdvufv20009v45s016fi7d0', 'cmfdous790000v4qkqknh9lyp', 'USER_LOGIN', 'ADMIN logged in: admin@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36', '2025-09-10 11:14:53.774'),
('cmfdvvx6s000cv45sia1c2bk9', 'cmfdous790000v4qkqknh9lyp', 'USER_LOGIN', 'ADMIN logged in: admin@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-09-10 11:16:02.884'),
('cmfdvypdv000iv45skqwme4kr', 'cmfdous790000v4qkqknh9lyp', 'USER_LOGIN', 'ADMIN logged in: admin@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-09-10 11:18:12.740'),
('cmff6et1f0001v4zgyo1ctbw6', 'cmfdous790000v4qkqknh9lyp', 'USER_LOGIN', 'ADMIN logged in: admin@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-09-11 08:58:26.305'),
('cmfhrbjv00001v4fw8eka9amq', 'cmfdous790000v4qkqknh9lyp', 'USER_LOGIN', 'ADMIN logged in: admin@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-09-13 04:19:18.730'),
('cmfhs5bkt000bv4fw1cl8man4', 'cmfdous790000v4qkqknh9lyp', 'USER_LOGIN', 'ADMIN logged in: admin@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36', '2025-09-13 04:42:27.677'),
('cmfi4lk250001v4zkme0zi080', 'cmfdous790000v4qkqknh9lyp', 'USER_LOGIN', 'ADMIN logged in: admin@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-09-13 10:31:00.552'),
('cmfi4mjio0003v4zk2yy7nuoc', 'cmfdous790000v4qkqknh9lyp', 'USER_LOGIN', 'ADMIN logged in: admin@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-09-13 10:31:46.512'),
('cmfi5iumz0007v4zk15japwjy', 'cmfdous790000v4qkqknh9lyp', 'USER_LOGIN', 'ADMIN logged in: admin@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-09-13 10:56:53.915'),
('cmfknoge00001v41wo2gi3sm6', 'cmfdous790000v4qkqknh9lyp', 'USER_LOGIN', 'ADMIN logged in: admin@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-09-15 05:00:40.823'),
('cmfko3b1c0007v41wkmup4w6r', 'cmfdous790000v4qkqknh9lyp', 'USER_LOGIN', 'ADMIN logged in: admin@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-09-15 05:12:13.729'),
('cmfksilzf0001v4eg8tbgdy8k', 'cmfdous790000v4qkqknh9lyp', 'USER_LOGIN', 'ADMIN logged in: admin@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-09-15 07:16:06.215'),
('cmfm2ucht0001v4lwvz9970qa', 'cmfdous790000v4qkqknh9lyp', 'USER_LOGIN', 'ADMIN logged in: admin@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-09-16 04:52:56.126'),
('cmfm32ttt0003v4lwms5xciar', 'cmfdous790000v4qkqknh9lyp', 'USER_LOGIN', 'ADMIN logged in: admin@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-09-16 04:59:31.841'),
('cmfm3c6xo0005v4lwtu8vp28m', 'cmfdous790000v4qkqknh9lyp', 'USER_LOGIN', 'ADMIN logged in: admin@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-09-16 05:06:48.732'),
('cmfmfc6xo0007v4lwz9jw6d3v', 'cmfdous790000v4qkqknh9lyp', 'USER_LOGIN', 'ADMIN logged in: admin@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-09-16 10:42:44.122'),
('cmfmfn7be0009v4lw34don81o', 'cmfdous790000v4qkqknh9lyp', 'USER_LOGIN', 'ADMIN logged in: admin@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-09-16 10:51:17.835'),
('cmfmgo4fo000bv4lw79lxp1xs', 'cmfdous790000v4qkqknh9lyp', 'USER_LOGIN', 'ADMIN logged in: admin@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-09-16 11:20:00.372'),
('cmfnlfibc0001v4gghmw8dhai', 'cmfdous790000v4qkqknh9lyp', 'USER_LOGIN', 'ADMIN logged in: admin@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-09-17 06:21:02.711'),
('cmfowt3e20001v4eoils8veyu', 'cmfdous790000v4qkqknh9lyp', 'USER_LOGIN', 'ADMIN logged in: admin@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-18 04:27:18.505'),
('cmfoy5irg0001v4p898l4xi5g', 'cmfoy56sw0000v4io6xe6zn4h', 'USER_LOGIN', 'ADMIN logged in: superadmin@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-18 05:04:57.915');

-- --------------------------------------------------------

--
-- Table structure for table `bank_details`
--

CREATE TABLE `bank_details` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `accountHolder` varchar(191) NOT NULL,
  `accountNumber` varchar(191) NOT NULL,
  `ifscCode` varchar(191) NOT NULL,
  `bankName` varchar(191) DEFAULT NULL,
  `passbookImage` varchar(191) DEFAULT NULL,
  `isVerified` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bank_details`
--

INSERT INTO `bank_details` (`id`, `userId`, `accountHolder`, `accountNumber`, `ifscCode`, `bankName`, `passbookImage`, `isVerified`, `createdAt`, `updatedAt`) VALUES
('cmfdvt67k0005v45sfc2r0efe', 'cmfdous790000v4qkqknh9lyp', 'AH', '1234567892525', 'qqqq1111', 'BN', 'public\\uploads\\bank\\passbook-2025-0.jpeg', 1, '2025-09-10 11:13:54.609', '2025-09-10 11:13:54.609'),
('cmfdvydc7000ev45slic0ds7u', 'cmfdvvimr000av45sm5uws8h2', 'AH', '12345678989', 'AAAA111111111', 'BN', 'public\\uploads\\bank\\passbook-2025-2.png', 0, '2025-09-10 11:17:57.127', '2025-09-10 11:17:57.127');

-- --------------------------------------------------------

--
-- Table structure for table `commission`
--

CREATE TABLE `commission` (
  `id` varchar(191) NOT NULL,
  `role` enum('SUPER_ADMIN','API_HOLDER','ADMIN','STATE_HOLDER','MASTER_DISTRIBUTOR','DISTRIBUTOR','AGENT') NOT NULL,
  `service` enum('IMPS','NEFT') NOT NULL,
  `from` double NOT NULL,
  `to` double NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `adminId` varchar(191) NOT NULL,
  `type` enum('FIXED','PERCENT') NOT NULL,
  `value` double NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `commission`
--

INSERT INTO `commission` (`id`, `role`, `service`, `from`, `to`, `createdAt`, `updatedAt`, `adminId`, `type`, `value`) VALUES
('cmfknpe5h0003v41w3h09b5vl', 'STATE_HOLDER', 'IMPS', 100, 1000, '2025-09-15 05:01:24.581', '2025-09-15 05:03:49.066', 'cmfdous790000v4qkqknh9lyp', 'FIXED', 10),
('cmfko5n6c0009v41w943275l3', 'DISTRIBUTOR', 'IMPS', 100, 1000, '2025-09-15 05:14:02.772', '2025-09-15 05:14:02.772', 'cmfdous790000v4qkqknh9lyp', 'FIXED', 10);

-- --------------------------------------------------------

--
-- Table structure for table `kyc_details`
--

CREATE TABLE `kyc_details` (
  `id` varchar(191) NOT NULL,
  `panNumber` varchar(10) NOT NULL,
  `aadhaarNumber` varchar(12) NOT NULL,
  `panImage` varchar(191) NOT NULL,
  `aadhaarImageFront` varchar(191) NOT NULL,
  `aadhaarImageBack` varchar(191) NOT NULL,
  `fatherName` varchar(191) NOT NULL,
  `dob` varchar(191) NOT NULL,
  `homeAddress` longtext NOT NULL,
  `kycStatus` enum('PENDING','VERIFIED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `shopName` longtext NOT NULL,
  `district` varchar(191) NOT NULL,
  `pinCode` varchar(191) NOT NULL,
  `state` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `shopAddress` longtext NOT NULL,
  `shopAddressImage` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `kyc_details`
--

INSERT INTO `kyc_details` (`id`, `panNumber`, `aadhaarNumber`, `panImage`, `aadhaarImageFront`, `aadhaarImageBack`, `fatherName`, `dob`, `homeAddress`, `kycStatus`, `shopName`, `district`, `pinCode`, `state`, `userId`, `shopAddress`, `shopAddressImage`, `createdAt`, `updatedAt`) VALUES
('cmfdvt67p0007v45s9fyrfcio', 'QQQQQ1234Q', '111111111111', 'public\\uploads\\kyc\\pan-2025-123456.jpeg', 'public\\uploads\\kyc\\aadhaar-front-2025-123456.jpeg', 'public\\uploads\\kyc\\aadhaar-back-2025-123456.jpeg', 'FN', '2000-01-01', 'HA', 'VERIFIED', 'SN', 'D', '123456', 'Bihar', 'cmfdous790000v4qkqknh9lyp', 'SA', 'public\\uploads\\kyc\\shop-address-2025-123456.jpeg', '2025-09-10 11:13:54.614', '2025-09-17 12:11:55.257'),
('cmfdvydch000gv45sj0hxj7nu', 'WWWWW1234W', '222222222222', 'public\\uploads\\kyc\\pan-2025-123456.jpeg', 'public\\uploads\\kyc\\aadhaar-front-2025-123456.png', 'public\\uploads\\kyc\\aadhaar-back-2025-123456.png', 'FN', '2003-10-10', 'HA', 'VERIFIED', 'SN', 'D', '123456', 'Haryana', 'cmfdvvimr000av45sm5uws8h2', 'SA', 'public\\uploads\\kyc\\shop-address-2025-123456.png', '2025-09-10 11:17:57.138', '2025-09-10 11:19:41.417');

-- --------------------------------------------------------

--
-- Table structure for table `payouttransaction`
--

CREATE TABLE `payouttransaction` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `amount` double NOT NULL,
  `status` enum('PENDING','SUCCESS','FAILED') NOT NULL DEFAULT 'PENDING',
  `requestId` varchar(191) NOT NULL,
  `utr` varchar(191) DEFAULT NULL,
  `provider` varchar(191) NOT NULL,
  `accountNumber` varchar(191) NOT NULL,
  `ifsc` varchar(191) NOT NULL,
  `meta` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`meta`)),
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `phone` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `role` enum('SUPER_ADMIN','API_HOLDER','ADMIN','STATE_HOLDER','MASTER_DISTRIBUTOR','DISTRIBUTOR','AGENT') NOT NULL,
  `walletBalance` double NOT NULL DEFAULT 0,
  `parentId` varchar(191) DEFAULT NULL,
  `subParentId` varchar(191) DEFAULT NULL,
  `isKyc` tinyint(1) NOT NULL DEFAULT 0,
  `status` enum('IN_ACTIVE','ACTIVE') NOT NULL DEFAULT 'IN_ACTIVE',
  `isAuthorized` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `phone`, `password`, `role`, `walletBalance`, `parentId`, `subParentId`, `isKyc`, `status`, `isAuthorized`, `createdAt`, `updatedAt`) VALUES
('cmfdous790000v4qkqknh9lyp', 'Admin', 'admin@gmail.com', '9999999999', '$2b$10$lyzCgkmaNMcHbSBPmwBT.utCO31K7DmcMmeF5xSUBLHOZFYAyoAVu', 'ADMIN', 0, NULL, NULL, 1, 'ACTIVE', 1, '2025-09-10 07:59:12.442', '2025-09-17 12:11:55.295'),
('cmfdvvimr000av45sm5uws8h2', 'sohail', 'info@primewebdev.in', '1236547892', '$2b$10$rOcqdT9Aze2bdwEeJpH/qevyS50ec4ANWZay5129RUDa5F855O65a', 'STATE_HOLDER', 0, 'cmfdous790000v4qkqknh9lyp', NULL, 1, 'ACTIVE', 1, '2025-09-10 11:15:44.019', '2025-09-17 11:58:37.574'),
('cmfoy56sw0000v4io6xe6zn4h', 'Super Admin', 'superadmin@gmail.com', '1234567895', '$2b$10$1CiU.yMNrU234ACxGWK70uvbL0FRqiKMMiOMKFIcqw.pfZcWslzS.', 'SUPER_ADMIN', 0, 'cmfdous790000v4qkqknh9lyp', NULL, 1, 'ACTIVE', 1, '2025-09-18 05:04:42.416', '2025-09-18 05:04:42.416');

-- --------------------------------------------------------

--
-- Table structure for table `user_limit`
--

CREATE TABLE `user_limit` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `maxLimit` double NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `wallet`
--

CREATE TABLE `wallet` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `balance` double NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `wallet_topup`
--

CREATE TABLE `wallet_topup` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `orderId` varchar(191) NOT NULL,
  `paymentId` varchar(191) DEFAULT NULL,
  `amount` double NOT NULL,
  `provider` varchar(191) NOT NULL,
  `paymentImage` varchar(191) DEFAULT NULL,
  `status` enum('PENDING','VERIFIED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `wallet_topup`
--

INSERT INTO `wallet_topup` (`id`, `userId`, `orderId`, `paymentId`, `amount`, `provider`, `paymentImage`, `status`, `createdAt`, `updatedAt`) VALUES
('cmfdwowm30001v43cu3pz11zs', 'cmfdvvimr000av45sm5uws8h2', 'BT_2025_4424', '123456', 10000, 'BANK_TRANSFER', 'public\\uploads\\walletTopup\\bank-transfer-2025-0.jpeg', 'PENDING', '2025-09-10 11:38:35.164', '2025-09-10 11:38:35.164'),
('cmfdxpczi0001v4cwasqugk38', 'cmfdvvimr000av45sm5uws8h2', 'BT_2025_7328', '1234567', 1000, 'BANK_TRANSFER', 'public\\uploads\\walletTopup\\bank-transfer-2025-0.jpeg', 'REJECTED', '2025-09-10 12:06:55.993', '2025-09-10 12:06:55.993'),
('cmfe38os7000rv47sfnlg6gbm', 'cmfdvvimr000av45sm5uws8h2', 'order_RFw3t422y37b1W', 'pay_RFw4V8e82jbqBO', 10000, 'RAZORPAY', NULL, 'PENDING', '2025-09-10 14:41:55.831', '2025-09-10 14:42:48.750'),
('cmff4gf310001v4bk5a3ewieq', 'cmfdvvimr000av45sm5uws8h2', 'BT_2025_9266', '12345665545', 10000, 'BANK_TRANSFER', 'public\\uploads\\walletTopup\\bank-transfer-2025-2.jpeg', 'VERIFIED', '2025-09-11 08:03:42.297', '2025-09-11 12:57:04.704'),
('cmff4gt960003v4bkww56fhe9', 'cmfdvvimr000av45sm5uws8h2', 'order_RGDofJXLISpKmH', 'pay_RGDpyaW2P9qARn', 10000, 'RAZORPAY', NULL, 'VERIFIED', '2025-09-11 08:04:00.667', '2025-09-11 08:05:33.352'),
('cmfhrcn8b0003v4fw3c6mh92t', 'cmfdvvimr000av45sm5uws8h2', 'order_RGx4PiVfxWY5Dm', 'pay_RGx7fXnR4d0SLL', 100, 'RAZORPAY', NULL, 'PENDING', '2025-09-13 04:20:09.755', '2025-09-13 04:23:33.418'),
('cmfhrhs8z0005v4fw90kc68r7', 'cmfdvvimr000av45sm5uws8h2', 'order_RGx8dSRQlw8TDv', 'pay_RGx9Wh31MAmbiu', 123, 'RAZORPAY', NULL, 'PENDING', '2025-09-13 04:24:09.539', '2025-09-13 04:25:19.176'),
('cmfhry3la0007v4fw9qrqncll', 'cmfdvvimr000av45sm5uws8h2', 'order_RGxM2MIz7QEcn5', 'pay_RGxMQzVDck7mII', 1, 'RAZORPAY', NULL, 'PENDING', '2025-09-13 04:36:50.734', '2025-09-13 04:37:31.931'),
('cmfhrzpxu0009v4fwm6jy8wf1', 'cmfdvvimr000av45sm5uws8h2', 'BT_2025_3399', '1111112222', 1222, 'BANK_TRANSFER', 'public\\uploads\\walletTopup\\bank-transfer-2025-2.png', 'PENDING', '2025-09-13 04:38:06.354', '2025-09-13 04:38:06.354'),
('cmfi5i3gv0005v4zkfurrrjgw', 'cmfdvvimr000av45sm5uws8h2', 'order_RH3ot3SCAoSIAY', NULL, 1, 'RAZORPAY', NULL, 'VERIFIED', '2025-09-13 10:56:18.703', '2025-09-13 10:56:18.703'),
('cmfo123720003v4gg5qb7x927', 'cmfdvvimr000av45sm5uws8h2', 'BT_2025_6349', 'dsaf231231', 11, 'BANK_TRANSFER', 'public\\uploads\\walletTopup\\bank-transfer-2025-1.jpeg', 'PENDING', '2025-09-17 13:38:30.443', '2025-09-17 13:38:30.443'),
('cmfo12ejp0005v4ggbniqso5q', 'cmfdvvimr000av45sm5uws8h2', 'order_RIgixi6ZASeoiF', NULL, 111, 'RAZORPAY', NULL, 'VERIFIED', '2025-09-17 13:38:45.157', '2025-09-17 13:38:45.157');

-- --------------------------------------------------------

--
-- Table structure for table `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('17e09ed0-30a1-4a89-9e3d-c2f533ac3ccf', '7a074ed752f86a173a18843b93962d5e2f9fdf03983a2bd2b0a95dc970175847', '2025-09-13 06:15:21.033', '20250913061520_init', NULL, NULL, '2025-09-13 06:15:20.946', 1),
('484dd9b6-d075-4e25-8725-7769acca7be0', 'e030a9df297bd49b79e563f4fa21056210f97999078485bbf90fe3d3ac6658b5', '2025-09-10 14:30:40.369', '20250910143040_init', NULL, NULL, '2025-09-10 14:30:40.316', 1),
('5f784224-c186-4a37-93d7-dedb15ed04b5', '0a9c1c6c95cee82c1566764d071f30e5c6818f42edd072bc05dec49d7cd26273', '2025-09-10 07:54:41.654', '20250910075441_init', NULL, NULL, '2025-09-10 07:54:41.079', 1),
('73d54075-6baf-494b-8e4c-e62371d58deb', 'a9a4d580ee057b4e4a4efda25edbc588519715c256035b00a0fd00524064e011', '2025-09-13 06:36:30.394', '20250913063630_init', NULL, NULL, '2025-09-13 06:36:30.314', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `api_keys`
--
ALTER TABLE `api_keys`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `api_keys_key_key` (`key`),
  ADD KEY `api_keys_userId_fkey` (`userId`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `audit_logs_userId_fkey` (`userId`);

--
-- Indexes for table `bank_details`
--
ALTER TABLE `bank_details`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `bank_details_accountNumber_key` (`accountNumber`),
  ADD UNIQUE KEY `bank_details_userId_accountNumber_key` (`userId`,`accountNumber`);

--
-- Indexes for table `commission`
--
ALTER TABLE `commission`
  ADD PRIMARY KEY (`id`),
  ADD KEY `commission_adminId_fkey` (`adminId`);

--
-- Indexes for table `kyc_details`
--
ALTER TABLE `kyc_details`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `kyc_details_panNumber_key` (`panNumber`),
  ADD UNIQUE KEY `kyc_details_aadhaarNumber_key` (`aadhaarNumber`),
  ADD KEY `kyc_details_userId_fkey` (`userId`);

--
-- Indexes for table `payouttransaction`
--
ALTER TABLE `payouttransaction`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `PayoutTransaction_requestId_key` (`requestId`),
  ADD KEY `PayoutTransaction_userId_fkey` (`userId`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_key` (`email`),
  ADD UNIQUE KEY `users_phone_key` (`phone`);

--
-- Indexes for table `user_limit`
--
ALTER TABLE `user_limit`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_limit_userId_key` (`userId`);

--
-- Indexes for table `wallet`
--
ALTER TABLE `wallet`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `wallet_userId_key` (`userId`);

--
-- Indexes for table `wallet_topup`
--
ALTER TABLE `wallet_topup`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `wallet_topup_orderId_key` (`orderId`),
  ADD UNIQUE KEY `wallet_topup_paymentId_key` (`paymentId`),
  ADD KEY `wallet_topup_userId_fkey` (`userId`);

--
-- Indexes for table `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `api_keys`
--
ALTER TABLE `api_keys`
  ADD CONSTRAINT `api_keys_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `bank_details`
--
ALTER TABLE `bank_details`
  ADD CONSTRAINT `bank_details_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `commission`
--
ALTER TABLE `commission`
  ADD CONSTRAINT `commission_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `kyc_details`
--
ALTER TABLE `kyc_details`
  ADD CONSTRAINT `kyc_details_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `payouttransaction`
--
ALTER TABLE `payouttransaction`
  ADD CONSTRAINT `PayoutTransaction_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `wallet`
--
ALTER TABLE `wallet`
  ADD CONSTRAINT `wallet_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `wallet_topup`
--
ALTER TABLE `wallet_topup`
  ADD CONSTRAINT `wallet_topup_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
