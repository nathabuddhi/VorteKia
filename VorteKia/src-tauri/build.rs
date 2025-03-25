fn main() {
    println!("cargo:rustc-link-arg=/STACK:33108864");

    tauri_build::build()
}
