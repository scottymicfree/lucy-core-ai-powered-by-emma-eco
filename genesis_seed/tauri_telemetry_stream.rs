use futures::StreamExt;
use tokio_stream::wrappers::ReceiverStream;
use tonic::Request;

// Include the compiled Protocol Buffers definition for the dashboard telemetry
// pub mod emma_telemetry {
//     tonic::include_proto!("telemetry");
// }
// use emma_telemetry::dashboard_client::DashboardClient;
// use emma_telemetry::StateMutation;

// NOTE: Mocked for genesis seed compilation. Generate protos before `cargo run`.
#[derive(Debug)]
pub struct StateMutation {
    pub payload_hash: String
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("[TAURI-GRPC] Booting Rust Telemetry multiplexer...");
    /*
    // Connect to the E.M.M.A. Core Linux Runtime via gRPC
    let mut client = DashboardClient::connect("http://[::1]:50051").await?;

    // Create an asynchronous channel for sending user commands from React to the Core
    let (tx, rx) = tokio::sync::mpsc::channel::<StateMutation>(32);
    let outbound = ReceiverStream::new(rx);

    // Establish the bidirectional streaming connection
    let response = client.stream_cognitive_telemetry(Request::new(outbound)).await?;
    let mut inbound = response.into_inner();

    // Process incoming cognitive telemetry continuously
    while let Some(result) = inbound.next().await {
        match result {
            Ok(telemetry_packet) => {
                println!("System State Shift: {} | TRN Active: {}", 
                         telemetry_packet.cognitive_mode, 
                         telemetry_packet.trn_gating_status);
            }
            Err(e) => {
                eprintln!("gRPC Telemetry Stream Error: {}", e);
                break;
            }
        }
    }
    */
    Ok(())
}
