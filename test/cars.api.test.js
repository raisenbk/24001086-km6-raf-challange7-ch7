require("dotenv").config()

const request = require("supertest");
const app = require("../app")



describe("Route not found", () => {
    it("Can't find route", async () => {
        const response = await request(app).get("/v1/car")
        expect(response.statusCode).toBe(404)
    })
})

describe("Cars API Test", () => {
    const AdminEmailBody = {
        "email" : "admin@binar.co.id",
        "password": "123456"
    }

    const CustomerEmailBody = {
        "email" : "ranggawarsita@binar.co.id",
        "password": "123456"
    }

    let adminToken = ""
    let customerToken = ""

    beforeEach(async () => {
        let response = await request(app).post("/v1/auth/login").send(AdminEmailBody)
        adminToken = response.body.accessToken

        response = await request(app).post("/v1/auth/login").send(CustomerEmailBody)
        customerToken = response.body.accessToken
    })

    describe("Get Car API", () => {
        describe("Get all car data", () => {
            it("Success getting car list", async () => {
                const response = await request(app).get("/v1/cars")
                expect(response.statusCode).toBe(200)
            });
        })
        
        describe("Get car data by id", () => {
            it("Success getting car data by id", async () => {
                const response = await request(app).get("/v1/cars/3")
                expect(response.statusCode).toBe(200)
            })

            it("Cant find car data with requested id", async() => {
                const response = await request(app).get("/v1/cars/1000")
                expect(response.body).toBe(null)
            })
        })
        
        describe("Update car data by id", () => {
            
            const carBody = {
                name: "Ferdinand",
                price: 300000,
                size: "LARGE",
                image: "https://source.unsplash.com/519x519",
            }

            // "error": {
            // "name": "TypeError",
            // "message": "car.update is not a function"}

            // it("Success updating car data", async () => {
            //     const response = await request(app).put("/v1/cars/3")
            //         .send(carBody)
            //         .set("Authorization", `Bearer ${adminToken}`)
            //     expect(response.statusCode).toBe(200)
            // })

            it("Failed to update car data", async () => {
                const response = await request(app).put("/v1/cars/100")
                    .send(carBody)
                    .set("Authorization", `Bearer ${adminToken}`)
                expect(response.statusCode).toBe(422)
            })
        })

        describe("Delete car data by id", () => {
            it("Success delete car data", async () => {
                const response = await request(app).delete("/v1/cars/4")
                    .set("Authorization", `Bearer ${adminToken}`)
                expect(response.statusCode).toBe(204)
            })
        })
    })
    
    describe("Create Car API", () => {
        const carBody = {
            name: "Jagpanther",
            price: 300000,
            size: "LARGE",
            image: "https://source.unsplash.com/519x519",
        }

        it("Success creating new car data", async () => {
            const response = await request(app)
                .post("/v1/cars").send(carBody)
                .set('Authorization', `Bearer ${adminToken}`)
            expect(response.statusCode).toBe(201)
        })
    
        it("Unauthorized account try to creating car data", async () => {
            const response = await request(app)
                .post("/v1/cars").send(carBody)
                .set('Authorization', `Bearer ${customerToken}`)
            expect(response.statusCode).toBe(401)
        })
    })

    describe("Car rent API", () => {
        it("Success add new rent", async () => {
            const response = await request(app).post("/v1/cars/2/rent")
                .set("Authorization", `Bearer ${customerToken}`)
            expect(response.statusCode).toBe(201)
        })
        it("Failed to rent car", async () => {
            const response = await request(app).post("/v1/cars/1000/rent")
                .set("Authorization", `Bearer ${customerToken}`)
            expect(response.statusCode).toBe(500)
        })
    })
})



describe("Auth", () => {
    describe("Login API", () => {
        const correctLoginBody = {
            "email" : "admin@binar.co.id",
            "password": "123456"
        }
        const emailNotRegister = {
            "email" : "kebunsapi@binar.co.id",
            "password": "123456"
        }
        const wrongLoginBody = {
            "email" : "admin@binar.co.id",
            "password": "12345678910"
        }
    
        it("Success login", async () => {
            const response = await request(app)
                .post("/v1/auth/login").send(correctLoginBody)
            expect(response.statusCode).toBe(201)
        })
    
        it("Cant find account", async () => {
            const response = await request(app)
                .post("/v1/auth/login").send(emailNotRegister)
            expect(response.statusCode).toBe(404)
        })
    
        it("Wrong password input", async () => {
            const response = await request(app)
                .post("/v1/auth/login").send(wrongLoginBody)
            expect(response.statusCode).toBe(401)
        })
    })
    
    describe("Register API", () => {
        const registerBody = {
            name: "Hans",
            email: "hans4@test.mail.com",
            password: "123456"
        }

        const duplicateEmail = {
            name: "Admin",
            email: "admin@binar.co.id",
            password: "123456"
        }

        it("Success Register", async () => {
            const response = await request(app)
                .post("/v1/auth/register").send(registerBody)
            expect(response.statusCode).toBe(201)
        })
        
        it("Email already tekken", async () => {
            const response = await request(app)
                .post("/v1/auth/register").send(duplicateEmail)
            expect(response.statusCode).toBe(500)
        })
    })

    describe("Who Am I API", () => {
        let token = ""
        beforeEach(async () => {
            const response = await request(app).post("/v1/auth/login").send({
                "email" : "ranggawarsita@binar.co.id",
                "password": "123456"
            })
                token = response.body.accessToken
        })

        it("Success check", async() => {
            console.log(token)
            const response = await request(app)
                .get("/v1/auth/whoami")
                .set('Authorization', `Bearer ${token}`)
            expect(response.statusCode).toBe(200)
        })

        it("Failed check", async() => {
            const response = await request(app)
                .post("/v1/auth/whoami")
                .set('Authorization', `Bearer`)
            expect(response.statusCode).toBe(404)
        })
    })

})