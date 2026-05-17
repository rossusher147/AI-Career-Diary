workspace {

    model {
        user = Person "User" {
            tags "User"
        }

        aicd = softwareSystem "AI Career Diary (AICD)" {
            tags "Application"

            ui = container "UI" {
                tags "UI"
            }

            api = container "FastAPI" {
                tags "API"

                diary_router = component "Diary Router" {
                    tags "Router"
                }

                page_router = component "Page Router" {
                    tags "Router"
                }

                auth_service = component "Auth Service" {
                    tags "Service"
                }

                repository = component "Repository" {
                    tags "Repository"
                }
            }

            db = container "Database" {
                tags "Database"
            }
        }

        keycloak = softwareSystem "Keycloak" {
            tags "External Service,Identity Provider"
        }


        /* RELATIONSHIPS */

        aicd -> keycloak "IDAM"
        user -> aicd "Uses"
        user -> ui "Uses"
        
        ui -> api "Requests"
        ui -> keycloak "User Login"
        api -> keycloak "JWT Validation"
        api -> db "Read/Write"

        diary_router -> repository
        diary_router -> auth_service
        page_router -> repository
        page_router -> auth_service
        auth_service -> keycloak
        repository -> db
    }

    views {
        systemContext aicd "Diagram1" {
            include *
        }

        container aicd "Diagram2" {
            include *
        }

        component api "Diagram3" {
            include *
        }

        styles {
            element "Element" {
                background #FFFFFF
                color #1168BD
                stroke #0B4884
                strokeWidth 5
                shape roundedbox
            }
            element "Application" {
                background #FFFFFF
                color #1168BD
                stroke #0B4884
                strokeWidth 5
                shape roundedbox
            }
            element "UI" {
                background #FFFFFF
                color #1168BD
                stroke #0B4884
                strokeWidth 5
                shape roundedbox
            }
            element "API" {
                background #FFFFFF
                color #1168BD
                stroke #0B4884
                strokeWidth 5
                shape roundedbox
            }
            element "User" {
                background #1F4E79
                color #FFFFFF
                stroke #173B5C
                strokeWidth 5
                shape person
            }
            element "Database" {
                background #FFFFFF
                color #78350F
                stroke #92400E
                strokeWidth 5
                shape cylinder
            }
            element "External Service" {
                background #1F4E79
                color #FFFFFF
                stroke #173B5C
                strokeWidth 5
                shape roundedbox
            }
            element "Identity Provider" {
                background #1F4E79
                color #FFFFFF
                stroke #173B5C
                strokeWidth 5
                shape roundedbox
            }
            element "Router" {
                background #FFFFFF
                color #1F4E79
                stroke #1F4E79
                strokeWidth 5
                shape roundedbox
            }
            element "Service" {
                background #FFFFFF
                color #1168BD
                stroke #0B4884
                strokeWidth 5
                shape roundedbox
            }
            element "Repository" {
                background #FFFFFF
                color #1168BD
                stroke #0B4884
                strokeWidth 5
                shape roundedbox
            }
        }
    }
}
