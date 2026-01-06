# Project Brief

## Project Name
NadPos-Restoran

## Overview
NadPos-Restoran is a comprehensive Point of Sale (POS) system designed for restaurants. It operates as a monorepo containing a desktop application for POS operations, a cloud-based server for backend logic, and a cloud admin panel for management.

## Core Components
1.  **POS Desktop (`apps/pos-desktop`)**: The primary interface for restaurant staff to take orders, process payments, and manage tables. Built with Electron and React.
2.  **Cloud Server (`apps/cloud-server`)**: The backend infrastructure handling data synchronization, user authentication, and business logic. Built with NestJS.
3.  **Cloud Admin (`apps/cloud-admin`)**: A web-based administration panel for restaurant owners/managers to view reports, manage menus, and configure settings.

## Goals
-   Provide a reliable and efficient POS experience for restaurant staff.
-   Ensure seamless data synchronization between offline-capable desktop clients and the cloud server.
-   Offer robust management tools for restaurant owners.
