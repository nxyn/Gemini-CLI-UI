#!/bin/bash

# Android Build Script for Gemini CLI UI
# This script helps build an Android APK for the React Native app

set -e  # Exit on any error

echo "🚀 Starting Android Build Process for Gemini CLI UI..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Please run this script from the project root.${NC}"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Error: Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Error: Node.js version 18+ is required. Current version: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js version check passed: $(node -v)${NC}"

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo -e "${YELLOW}⚠️  EAS CLI not found. Installing...${NC}"
    npm install -g eas-cli
    echo -e "${GREEN}✅ EAS CLI installed${NC}"
fi

# Check if Expo CLI is installed
if ! command -v expo &> /dev/null; then
    echo -e "${YELLOW}⚠️  Expo CLI not found. Installing...${NC}"
    npm install -g @expo/cli
    echo -e "${GREEN}✅ Expo CLI installed${NC}"
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from template...${NC}"
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${YELLOW}📝 Please edit .env file with your configuration before building.${NC}"
        echo -e "${YELLOW}   Required: EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY, GEMINI_API_KEY${NC}"
    else
        echo -e "${RED}❌ Error: .env.example file not found. Please create .env file manually.${NC}"
        exit 1
    fi
fi

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install --legacy-peer-deps

echo -e "${GREEN}✅ Dependencies installed${NC}"

# Check if user is logged into Expo
echo -e "${BLUE}🔐 Checking Expo login status...${NC}"
if ! expo whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged into Expo. Please login:${NC}"
    expo login
    echo -e "${GREEN}✅ Logged into Expo${NC}"
else
    echo -e "${GREEN}✅ Already logged into Expo as: $(expo whoami)${NC}"
fi

# Build options menu
echo -e "${BLUE}🏗️  Select build type:${NC}"
echo "1) Development build (for testing)"
echo "2) Preview build (for sharing)"
echo "3) Production build (for release)"

read -p "Enter your choice (1-3): " build_choice

case $build_choice in
    1)
        build_profile="development"
        echo -e "${YELLOW}🔧 Building development APK...${NC}"
        ;;
    2)
        build_profile="preview"
        echo -e "${YELLOW}🔧 Building preview APK...${NC}"
        ;;
    3)
        build_profile="production"
        echo -e "${YELLOW}🔧 Building production APK...${NC}"
        ;;
    *)
        echo -e "${RED}❌ Invalid choice. Using preview build.${NC}"
        build_profile="preview"
        ;;
esac

# Configure EAS if not already configured
if [ ! -f "eas.json" ]; then
    echo -e "${YELLOW}⚠️  EAS configuration not found. Creating...${NC}"
    eas build:configure
    echo -e "${GREEN}✅ EAS configured${NC}"
fi

# Start the build
echo -e "${BLUE}🚀 Starting EAS build with profile: $build_profile${NC}"
echo -e "${BLUE}   This may take 10-20 minutes...${NC}"

# Run the build
eas build --platform android --profile $build_profile

echo -e "${GREEN}🎉 Build completed successfully!${NC}"
echo -e "${GREEN}📱 Check your Expo dashboard to download the APK${NC}"
echo -e "${GREEN}🔗 https://expo.dev/accounts/${USER}/projects${NC}"

# Instructions for installing
echo -e "${BLUE}📋 Installation instructions:${NC}"
echo "1. Download the APK from Expo dashboard"
echo "2. On your Android device, enable 'Unknown Sources' in settings"
echo "3. Install the APK file"
echo "4. Launch the app and test!"

echo -e "${GREEN}✨ Build process completed! ✨${NC}"