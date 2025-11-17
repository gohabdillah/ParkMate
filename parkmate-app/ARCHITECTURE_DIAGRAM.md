# ParkMate System Architecture Diagram

```mermaid
%% =========================================
%% ParkMate System Architecture
%% =========================================
graph TD
    %% ================== PRESENTATION LAYER ==================
    subgraph P["Presentation Layer"]
        P1["HomePage<br/>(Map Interface)"]
        P2["ProfilePage"]
        P3["HistoryPage"]
        P4["SettingsPage"]
        P5["AuthUI<br/>(Login/Register)"]
        P6["GoogleMapComponent"]
        P7["Navbar/BottomNav"]
    end

    %% ================== APP LOGIC LAYER ==================
    subgraph L["App Logic Layer"]
        L1["AuthController<br/>(register, login, logout)"]
        L2["CarparkController<br/>(search, details, nearby)"]
        L3["UserController<br/>(profile, settings)"]
        L4["FavoritesController<br/>(add, remove, list)"]
        L5["HistoryController<br/>(search history)"]
        L6["FeedbackController<br/>(user feedback)"]
        L7["ExternalAPIService<br/>(data.gov.sg, Google Maps)"]
    end

    %% ================== OBJECT LAYER ==================
    subgraph O["Object Layer"]
        O1["User<br/>(id, email, name, password)"]
        O2["Carpark<br/>(id, address, lat/lng, type)"]
        O3["Favorite<br/>(user_id, carpark_id)"]
        O4["History<br/>(user_id, search_query)"]
        O5["Feedback<br/>(user_id, content, rating)"]
        O6["UserSettings<br/>(theme, notifications)"]
        O7["CarparkAvailability<br/>(lots available, total)"]
    end

    %% ================== PERSISTENT DATA LAYER ==================
    subgraph D["Persistent Data Layer"]
        D1["PostgreSQL Database<br/>(users, carparks, favorites,<br/>history, feedback, settings)"]
        D2["Redis Cache<br/>(carpark availability,<br/>session data)"]
    end

    %% ================== FLOWS ==================
    %% Presentation → Logic
    P1 --> L2
    P1 --> L7
    P2 --> L3
    P2 --> L4
    P3 --> L5
    P4 --> L3
    P5 --> L1
    P6 --> L2
    P7 --> L1
    P7 --> L3

    %% Logic → Object
    L1 --> O1
    L2 --> O2
    L2 --> O7
    L3 --> O1
    L3 --> O6
    L4 --> O3
    L5 --> O4
    L6 --> O5
    L7 --> O2
    L7 --> O7

    %% Object → Database
    O1 --> D1
    O2 --> D1
    O3 --> D1
    O4 --> D1
    O5 --> D1
    O6 --> D1
    O7 --> D2

    %% ================== STYLING ==================
    %% --- Presentation Layer (blue) ---
    classDef ui fill:#b3d9ff,stroke:#004080,stroke-width:2px,color:#001f33,font-weight:bold;
    class P1,P2,P3,P4,P5,P6,P7 ui;

    %% --- App Logic Layer (orange) ---
    classDef logic fill:#ffe0b3,stroke:#995c00,stroke-width:2px,color:#331a00,font-weight:bold;
    class L1,L2,L3,L4,L5,L6,L7 logic;

    %% --- Object Layer (green) ---
    classDef object fill:#c2f0c2,stroke:#267326,stroke-width:2px,color:#0d260d,font-weight:bold;
    class O1,O2,O3,O4,O5,O6,O7 object;

    %% --- Persistent Layer (grey) ---
    classDef data fill:#e6e6e6,stroke:#595959,stroke-width:2px,color:#1a1a1a,font-weight:bold;
    class D1,D2 data;
```

## Layer Breakdown

### 🎨 Presentation Layer (Frontend - React Components)
- **HomePage**: Main map interface for searching carparks
- **ProfilePage**: User profile management
- **HistoryPage**: Search history display
- **SettingsPage**: User preferences and settings
- **AuthUI**: Login and registration forms
- **GoogleMapComponent**: Interactive map with markers
- **Navbar/BottomNav**: Navigation components

### ⚙️ App Logic Layer (Backend Controllers & Services)
- **AuthController**: Handles user authentication (register, login, logout, token refresh)
- **CarparkController**: Manages carpark search, details, nearby locations
- **UserController**: User profile and settings management
- **FavoritesController**: Add/remove/list favorite carparks
- **HistoryController**: Track and retrieve search history
- **FeedbackController**: Collect and manage user feedback
- **ExternalAPIService**: Integration with data.gov.sg and Google Maps APIs

### 📦 Object Layer (Data Models & Entities)
- **User**: User account information (id, email, name, password_hash)
- **Carpark**: Carpark details (id, address, coordinates, type, amenities)
- **Favorite**: User's saved carparks (user_id, carpark_id)
- **History**: Search history (user_id, search_query, timestamp)
- **Feedback**: User feedback (user_id, content, rating)
- **UserSettings**: User preferences (theme, notifications)
- **CarparkAvailability**: Real-time availability data (lots_available, total_lots)

### 💾 Persistent Data Layer (Databases)
- **PostgreSQL Database**: 
  - Tables: users, carparks, favorites, history, feedback, user_settings
  - Stores permanent data with ACID compliance
- **Redis Cache**: 
  - Caches carpark availability data (5-minute TTL)
  - Session management and temporary data

## Architecture Patterns

1. **Layered Architecture**: Clear separation between presentation, logic, object, and data layers
2. **Repository Pattern**: Data access abstraction in each module
3. **Service Layer Pattern**: Business logic encapsulation in controllers
4. **MVC Pattern**: Model-View-Controller for API endpoints
5. **Caching Strategy**: Redis for frequently accessed data (availability)
6. **RESTful API**: Standard HTTP methods and resource-based routing

## Data Flow Example

1. **User searches for carparks**:
   - HomePage (Presentation) → CarparkController (Logic)
   - CarparkController → Carpark & CarparkAvailability (Objects)
   - Objects → PostgreSQL + Redis (Persistent Layer)
   - Response flows back through the layers

2. **User adds favorite**:
   - ProfilePage (Presentation) → FavoritesController (Logic)
   - FavoritesController → Favorite (Object)
   - Favorite → PostgreSQL (Persistent Layer)

## External Integrations

- **data.gov.sg API**: Real-time carpark availability data
- **Google Maps API**: Geocoding, map display, and navigation
