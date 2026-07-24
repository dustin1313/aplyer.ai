# Aplyer.ai

**Stop Skipping Jobs.**

Aplyer is a Chrome extension that activates on employer careers pages (Workday, Greenhouse, Lever, and more) and fills open-ended application questions in the candidate's own voice using their resume and writing samples. Built for the nearly 6 in 10 job seekers who have abandoned an application midway because it was too long or complicated (LiveCareer, 2025).

## The Problem

Job seekers close the page when they see a wall of written application questions. Not because they are unqualified, but because the friction is too high. The applications everyone races past with one click have the most competition. The ones with written questions, the ones people skip, have the least. Aplyer answers those for you, so you apply where your odds are better.

## What It Does

- Detects application questions automatically on careers pages, no manual trigger
- Generates voice-matched answers using the candidate's resume and writing samples
- Shows three confidence indicators: Voice Match, Low AI Signature, and Recruiter-Ready
- Logs every application automatically
- Works on Workday, Greenhouse, and Lever (MVP)

## Tech Stack (in development)

- Chrome Extension (Manifest V3)
- JavaScript / HTML / CSS
- Anthropic Claude API for answer generation
- WriteDNA Technology for stylometric voice matching (spaCy, textstat, custom Python, run locally)
- Stripe for payments
- Free tier plus paid subscription model

## Status

Pre-launch. Waitlist open at [aplyer.ai](https://aplyer.ai).

Built by a recruiter who spent 8 years reading these answers.
