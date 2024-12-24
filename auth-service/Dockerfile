FROM golang:1.20-alpine

WORKDIR /app

COPY go.mod ./
COPY go.sum ./
RUN go mod download

COPY . .

# 설정 파일을 /app/config 디렉토리로 복사
RUN mkdir -p /app/config
COPY config/config.yaml /app/config/

RUN go build -o auth-service ./main.go

CMD ["./auth-service"]
