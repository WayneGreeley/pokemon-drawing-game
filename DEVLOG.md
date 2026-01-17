# Development Log: Pokémon Drawing Game

## Project Overview
An AI-powered web application where users draw Pokémon and receive AI-generated identification with confidence scores and explanations. Built with Vue 3, AWS Bedrock, and deployed using serverless infrastructure.

## Project Origins & Disclaimer
**Note:** This project was originally started for the Kiro Halloween Challenge in early December 2025, but I ran out of Kiro credits too quickly to complete it. The project was resumed in January 2026 for the Dynamous Kiro Hackathon with 2000 credits provided, allowing for proper completion.

---

## Development Timeline

### Phase 1: Initial Halloween Challenge (December 2025)
**December 3, 2025** - Project inception 

#### Day 1: Foundation & Planning
- **Initial commit** - Set up GitHub repository
- **Spec creation** - Used Kiro's spec-driven development to create comprehensive requirements and design documents
- **Project setup** - Initialized Vue 3 + TypeScript + Vite project structure
- **Halloween theme implementation** - Created spooky dark theme with purple/black color scheme

**Key Decision:** Started with Kiro's requirements-first approach, creating detailed specs before any coding. This systematic approach proved invaluable for managing complexity.

#### Technical Challenges Encountered:
- Learning Kiro's spec system and task-driven development
- Balancing Halloween aesthetics with usability
- Setting up proper TypeScript configuration for Vue 3

**December 3, 2025** - **Credits exhausted** - Had to pause development after implementing basic drawing canvas and Halloween theme. 50 Kiro credits used.

### Phase 2: Theme Pivot (December 29, 2025)
**December 29, 2025** - **Theme adjustment**
- Removed Halloween/contest references while keeping the appealing dark color scheme
- Realized the core concept (AI Pokémon identification) was strong enough without seasonal theming

### Phase 3: Hackathon Revival (January 2026)
**January 4, 2026** - **Project resumed** 

#### Rapid Development Sprint:
- **Rate limiting system** - Implemented localStorage-based session tracking (10 uploads/hour)
- **Upload service** - Created comprehensive service with retry logic and error handling
- **AWS infrastructure** - Built complete SAM template with Bedrock Agent integration

**January 11, 2026** - **Backend deployment**
- Successfully deployed Lambda Function URL with Bedrock Agent
- Implemented comprehensive CloudWatch monitoring and cost controls
- Achieved fully functional backend infrastructure
- 50 Kiro credits used.


### Phase 4: Integration Testing & Critical Discovery (January 15, 2026)

#### Morning: Lambda Deployment Fixes
**CORS Headers Issue - RESOLVED**
- **Problem:** Lambda responses had duplicate CORS headers causing "multiple values" error
- **Root cause:** Both Lambda code AND Function URL CORS config were setting headers
- **Solution:** Removed CORS headers from Lambda `createCorsResponse()` function, letting Function URL config handle it exclusively
- **Result:** Clean CORS responses without duplication

**IAM Permissions Update - RESOLVED**
- **Problem:** Bedrock Agent invocation failing with permission errors
- **Solution:** Updated `lambda/template.yaml` to include both:
  - `bedrock-agent-runtime:InvokeAgent`
  - `bedrock:InvokeAgent`
  - Used wildcard resource (`*`) instead of specific ARN for flexibility
- **Deployment:** Successfully ran `sam build` and `sam deploy` 

#### Afternoon: End-to-End Testing
**Playwright Integration Test**
- Tested from CloudFront URL: `https://your-distribution.cloudfront.net`
- Drew Pikachu and submitted successfully
- Lambda invoked correctly with proper CORS handling
- Request reached Bedrock Agent

#### Critical Discovery: Bedrock Agent Limitation
**The Fundamental Issue:**
- **Bedrock Agents do NOT support image analysis** through the `sessionState.files` parameter
- The `files` parameter is designed for **document attachments** (PDFs, text files), not vision model image analysis
- Error received: "The overridden prompt that you provided is incorrectly formatted"
- This is a **fundamental API limitation**, not a configuration issue

**Why This Matters:**
- The entire project architecture was built around using Bedrock Agents for learning purposes
- Bedrock Agents are designed for text-based conversational AI with tool use and knowledge bases
- Image analysis with vision models requires the **InvokeModel API directly**, not the Agent API
- This represents a critical architectural mismatch between project goals and AWS service capabilities

**Architectural Decision Point:**
The project now faces two paths:
1. **Pivot to InvokeModel API**: Abandon Bedrock Agents, use direct model invocation (defeats learning goal)
2. **Redesign for Agent Orchestration**: Use Agents to orchestrate text-based Pokémon identification without image analysis (fundamentally changes the project)

**Current Status:** Project paused pending architectural decision. All infrastructure is deployed and working correctly - the limitation is in the AWS service design, not our implementation.

#### Kiro/AI Critique
This project is not that big nor techically difficult, however the Kiro chat has started summerizing the chat and starting a new chat session after about five interactions. Annoying.
I have worked with Github Copilot a lot previously and never had this issue before.
"The conversation in this session is about to reach the agent context limit. I'm summarizing earlier messages, and only the summary will be sent to the agent as context instead of the full text."

### Phase 5: Architecture Pivot & Final Implementation (January 17, 2026)

#### Morning: Critical Architecture Decision
**The Bedrock Agent Limitation Discovery:**
After extensive debugging, discovered that **Bedrock Agents fundamentally do not support image analysis**. The `sessionState.files` parameter is designed for document attachments (PDFs, text), not vision model image processing. This was a critical learning moment about AWS service boundaries.

**Architecture Pivot Decision:**
- **From:** Bedrock Agent orchestration (learning goal)
- **To:** Direct InvokeModel API with Amazon Nova Lite (functional goal)
- **Rationale:** Project completion takes priority over specific service learning

#### Implementation Sprint: InvokeModel Integration
**Lambda Function Overhaul:**
1. **Dependency Update**: Replaced `@aws-sdk/client-bedrock-agent-runtime` with `@aws-sdk/client-bedrock-runtime`
2. **Model Selection**: Switched to Amazon Nova Lite (`amazon.nova-lite-v1:0`) - AWS's newest multimodal model
3. **API Format Discovery**: Through trial and error, learned Nova Lite's specific InvokeModel format requirements

**Critical Technical Challenges:**

**Challenge 1: Model API Format Confusion**
- **Problem**: Amazon Q provided multiple conflicting code examples for Nova Lite
- **Attempts**: Tried Converse API format, various InvokeModel formats
- **Errors**: "extraneous key [temperature]", "extraneous key [top_p]", "extraneous key [max_tokens]"
- **Solution**: Found correct format through systematic parameter elimination:
  ```javascript
  {
    schemaVersion: "messages-v1",
    messages: [{ role: "user", content: [image, text] }],
    inferenceConfig: { maxTokens: 1000, temperature: 0.7 }
  }
  ```

**Challenge 2: Model ID Regional Issues**
- **Problem**: Used incorrect model ID `us.amazon.nova-lite-v1:0` causing us-west-2 region errors
- **Root Cause**: Model ID prefix confusion led to wrong region routing
- **Solution**: Corrected to `amazon.nova-lite-v1:0` and ensured all resources in us-east-1

**Challenge 3: IAM Permissions Mismatch**
- **Problem**: IAM policy granted access to old model ID format
- **Solution**: Updated CloudFormation template with correct foundation model ARN

#### Afternoon: End-to-End Success
**Deployment Success:**
- Lambda function successfully invoking Amazon Nova Lite
- Proper JSON response parsing and validation
- Complete error handling with user-friendly messages
- CORS working correctly with CloudFront

**E2E Testing Results:**
- ✅ Frontend loads and renders correctly
- ✅ Drawing canvas functional (manual testing confirmed)
- ✅ Lambda Function URL integration working
- ✅ Amazon Nova Lite processing images and returning structured responses
- ✅ Results display showing Pokémon identification with confidence scores
- ⚠️ Automated drawing simulation has limitations (Playwright vs Vue.js event handling)

**Key Learning:** E2E test automation revealed that while the core functionality works perfectly, simulating canvas drawing events in automated tests is complex due to Vue.js event handling specifics.

#### Final Status: **FULLY FUNCTIONAL** 🎉
The Pokémon Drawing Game is now completely operational:
- Users can draw Pokémon on the canvas
- AI successfully identifies drawings with confidence scores and explanations
- All security, rate limiting, and error handling working as designed
- Deployed on AWS with proper monitoring and cost controls

**Architecture Achievement:**
Successfully pivoted from a blocked Bedrock Agent approach to a working InvokeModel implementation, demonstrating adaptability and problem-solving in cloud AI development.

**Kiro Development Insight:**
This phase highlighted Kiro's strength in systematic debugging and iterative problem-solving. The spec-driven approach helped maintain focus during the architecture pivot, ensuring all requirements were still met despite the fundamental API change.

### Phase 6: Fully tested (TBD)

---

## Technical Architecture Decisions

### Frontend: Vue 3 + TypeScript
**Why Vue 3?** This is my daily driver at work - leveraging existing expertise for rapid development while exploring new Kiro workflows.

**Key Features:**
- HTML5 Canvas for drawing interface
- Reactive state management for UI controls
- Component-based architecture for maintainability

### Backend: AWS Serverless
**Why AWS Bedrock?** Strategic learning goal - wanted to gain hands-on experience with AWS's AI services.

**Architecture:**
- **Lambda Function URL** - Serverless, cost-effective API endpoint
- **Bedrock Agent** - Claude 3 Haiku for Pokémon identification
- **CloudFront + S3** - Global content delivery for frontend
- **CloudWatch** - Comprehensive monitoring and cost protection

### Infrastructure as Code (IaC)
**Why SAM?** IaC is essential for reproducible, secure deployments. SAM provides:
- Declarative infrastructure definition
- Built-in security best practices
- Cost optimization through serverless architecture

---

## Cost & Security Optimization

### Cost Controls Implemented:
- **Conservative CloudWatch alarms**: 100 invocations/day, 233/week limits
- **Serverless architecture**: Pay-per-use Lambda functions
- **Efficient AI model**: Claude 3 Haiku (cost-optimized)
- **Rate limiting**: 10 uploads per hour per user

### Security Measures:
- **CORS restrictions**: Proper cross-origin controls
- **Input validation**: Image size and format validation
- **Error handling**: No credential exposure in logs
- **HTTPS enforcement**: All communications encrypted

---

## Kiro CLI Experience

### Most Valuable Kiro Features:

#### 1. **MCP (Model Context Protocol) Integration**
The game-changer for solo development. Access to:
- **GitHub MCP**: Seamless repository management and deployment
- **AWS MCP**: Infrastructure documentation and best practices
- **Playwright MCP**: Future testing capabilities

#### 2. **Spec-Driven Development**
- **Requirements-first approach**: Forced systematic thinking about user needs
- **Task breakdown**: Complex features became manageable incremental steps
- **Traceability**: Every implementation tied back to specific requirements

#### 3. **Systematic Task Execution**
- **One task at a time**: Prevented scope creep and maintained focus
- **Progress tracking**: Clear visibility into completion status
- **Incremental validation**: Catch issues early in development cycle

### Development Workflow Evolution:
1. **Requirements gathering** → Comprehensive user stories and acceptance criteria
2. **Design creation** → Technical architecture with correctness properties
3. **Task planning** → Granular implementation steps
4. **Systematic execution** → One task at a time with validation

---

## Technical Challenges & Solutions

### Challenge 1: CloudWatch Alarm Configuration
**Problem:** Initial alarm period (30 days) exceeded AWS limits for evaluation periods.
**Solution:** Adjusted to 7-day periods with proportional thresholds (233 invocations/week ≈ 1000/month).

### Challenge 2: S3 Bucket Policy Circular Dependencies
**Problem:** CloudFront distribution and S3 bucket policy had circular references.
**Solution:** Simplified policy structure and used proper dependency ordering.

### Challenge 3: Lambda Function URL Output References
**Problem:** Attempted to reference non-existent `FunctionUrl` attribute on Lambda function.
**Solution:** Correctly referenced the separate `AWS::Lambda::Url` resource.

---

## Current Status

### ✅ Completed (Tasks 1-12.5):
- Complete project structure and dependencies
- Drawing canvas with tools (brush, eraser, color picker)
- Rate limiting system with UI feedback
- Upload service with error handling and retry logic
- Full AWS infrastructure deployed via SAM
- **Lambda Function URL with Amazon Nova Lite InvokeModel integration**
- **Complete AI recognition pipeline working end-to-end**
- CloudWatch monitoring and cost protection
- Security controls and CORS configuration
- Results display component with AI responses
- Frontend deployed to CloudFront
- **End-to-end integration testing completed successfully**

### 🚧 In Progress:
- **Task 12.6**: Final hackathon documentation updates

### 🎯 Next Milestones:
1. ✅ ~~Complete results display UI for AI responses~~
2. ✅ ~~Deploy frontend to CloudFront~~
3. ✅ ~~End-to-end integration testing~~
4. 🚧 Final documentation polish for hackathon submission

---

## Lessons Learned

### About Kiro:
- **MCP tools are transformative** for solo developers - GitHub, AWS, and Playwright integration makes complex projects manageable
- **Spec-driven development** prevents feature creep and maintains focus
- **Task-based execution** creates sustainable development rhythm

### About AWS Bedrock:
- **Bedrock Agents have limitations** - do not support image analysis, only document attachments
- **InvokeModel API is more direct** - better for vision model integration like Amazon Nova Lite
- **Model API documentation can be inconsistent** - requires systematic testing to find correct formats
- **Regional model availability** - model IDs and regions must be carefully matched
- **Cost controls** are essential - easy to rack up charges without proper limits
- **Lambda Function URLs** are perfect for simple API endpoints

### About Project Management:
- **Credit management** is crucial for Kiro projects - plan development phases around credit availability
- **Infrastructure-first** approach pays dividends in deployment confidence
- **Security and cost optimization** should be built in from the start, not retrofitted

---

## Innovation Highlights

### Technical Innovation:
- **Serverless AI pipeline**: Canvas → Lambda → Bedrock → Results
- **Cost-optimized architecture**: Conservative limits with user-friendly feedback
- **Security-first design**: Comprehensive input validation and error handling

### Development Innovation:
- **Kiro MCP integration**: Leveraging multiple MCP servers for complex project management
- **Spec-driven AI development**: Systematic approach to AI feature implementation
- **Hackathon resurrection**: Successfully reviving and completing a paused project

---

## Future Enhancements
- Property-based testing implementation (marked as optional tasks)
- Enhanced UI with drawing tutorials
- Multi-language support for Pokémon names
- Advanced drawing tools (layers, undo/redo)
- Social features (sharing drawings, leaderboards)

---

*This project demonstrates the power of combining systematic development practices (Kiro specs) with modern cloud architecture (AWS serverless) to create innovative AI-powered applications as a solo developer.*