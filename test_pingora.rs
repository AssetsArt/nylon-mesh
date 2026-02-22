use pingora_http::ResponseHeader;
use http::StatusCode\;

fn main() {
    let mut header = ResponseHeader::build(StatusCode::OK, None).unwrap();
    let name = String::from("X-Test");
    let value = String::from("value");
    // header.insert_header(name, value).unwrap(); // try this
}
