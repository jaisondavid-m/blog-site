FROM golang:1.26-alpine AS builder

WORKDIR /app

# RUN apk add --no-cache git

COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux \
    go build -trimpath -ldflags="-s -w" \
    -o server .

# FROM alpine:3.20
FROM gcr.io/distroless/static-debian12

RUN apk add --no-cache ca-certificates

WORKDIR /app

COPY --from=builder /app/server ./server

RUN mkdir uploads

EXPOSE 8080

ENTRYPOINT ["./server"]