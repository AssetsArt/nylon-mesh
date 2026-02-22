#[tokio::main]
async fn main() {
    let mut pipe = redis::pipe();
    // pipe.set_ex("key", "val", 60); // Check if this exists
    pipe.cmd("SETEX").arg("key").arg(60).arg("val");
}
