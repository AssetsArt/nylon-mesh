use pingora_load_balancing::{
    LoadBalancer,
    selection::{Random, RoundRobin},
};
use std::sync::Arc;

pub enum MeshLoadBalancer {
    RoundRobin(Arc<LoadBalancer<RoundRobin>>),
    Random(Arc<LoadBalancer<Random>>),
}

impl MeshLoadBalancer {
    pub fn select(
        &self,
        key: &[u8],
        max_iterations: usize,
    ) -> Option<pingora_load_balancing::Backend> {
        match self {
            Self::RoundRobin(lb) => lb.select(key, max_iterations),
            Self::Random(lb) => lb.select(key, max_iterations),
        }
    }
}
