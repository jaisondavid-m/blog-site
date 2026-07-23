FROM golang:1.26-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux \
    go build -trimpath -ldflags="-s -w" \
    -o server .

# FROM alpine:3.20
FROM gcr.io/distroless/static-debian12

WORKDIR /app

COPY --from=builder /app/server ./server

COPY uploads ./uploads

EXPOSE 8080

ENTRYPOINT ["./server"]