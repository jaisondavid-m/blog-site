package cache

import (

	"time"
	"encoding/json"

	"server/config"

)

func Get[T any](key string) (T, bool) {

	var out T

	val, err := config.RDB.Get(config.Ctx, key).Result()

	if err != nil {
		return out, false
	}

	if err := json.Unmarshal([]byte(val), &out); err != nil {
		return out, false
	}

	return out, true

}

func Set(key string, value any, ttl time.Duration) {

	data, err := json.Marshal(value)

	if err != nil {
		return
	}

	config.RDB.Set(config.Ctx, key, data, ttl)

}

func Delete(keys ...string) {

	if len(keys) > 0 {
		config.RDB.Del(config.Ctx, keys...)
	}

}