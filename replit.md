# Testosterone Assessment Tool

## Overview

This is a medical web application designed to assess testosterone levels and provide AI-powered hypogonadism analysis. The application allows healthcare professionals to input patient data (testosterone levels, age, ADAM score) and receive comprehensive assessment results including percentile calculations, AI-driven risk analysis, and clinical recommendations. The tool supports both conventional (ng/dL) and SI (nmol/L) units and provides detailed medical interpretations for clinical decision support.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for type-safe component development
- **Vite** as the build tool and development server for fast hot module replacement
- **Tailwind CSS** for utility-first styling with custom medical-themed color palette
- **shadcn/ui** component library providing consistent, accessible UI components
- **React Hook Form** with Zod validation for robust form handling and input validation
- **TanStack Query** for server state management, caching, and API communication
- **Wouter** for lightweight client-side routing

### Backend Architecture
- **Express.js** server with TypeScript for API endpoints
- **RESTful API** design with `/api/assessments` endpoint for testosterone assessment creation
- **In-memory storage** using Map-based data structures (designed to be replaced with database)
- **Modular service layer** separating business logic (testosterone calculations, AI analysis)
- **Middleware** for request logging, JSON parsing, and error handling

### Data Storage Solutions
- **Drizzle ORM** with PostgreSQL schema definitions for future database integration
- **Current implementation** uses in-memory storage with structured interfaces
- **Database schema** includes users table and testosterone_assessments table with proper relationships
- **Neon Database** integration configured via connection string

### Authentication and Authorization
- **Session-based authentication** prepared with connect-pg-simple for PostgreSQL session storage
- **User management** with username/password authentication schema
- **Security middleware** ready for implementation of protected routes

### External Service Integrations
- **OpenAI GPT-4** integration for AI-powered hypogonadism risk assessment
- **Medical calculations** using age-adjusted testosterone percentile algorithms
- **ADAM questionnaire** scoring integration for comprehensive testosterone deficiency evaluation

### Key Design Decisions

**Monorepo Structure**: Single repository with shared TypeScript schemas between client and server, enabling type safety across the full stack and reducing code duplication.

**Component-Based UI**: Modular React components (AssessmentForm, ResultsPanel) with clear separation of concerns, making the application maintainable and testable.

**Schema-First Development**: Drizzle schema definitions serve as the single source of truth for data structures, with Zod validation automatically generated from database schemas.

**Service Layer Pattern**: Business logic isolated in dedicated service modules (testosterone calculations, OpenAI integration) for better testability and maintainability.

**Progressive Enhancement**: Application starts with in-memory storage and can be upgraded to full database persistence without changing the interface contracts.