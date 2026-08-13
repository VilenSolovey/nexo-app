import { useEffect } from "react"
import { Asset } from "expo-asset"

const PRELOADED_APP_ASSETS = [
  require("../../assets/images/trial-icon.png"),
  require("../../assets/images/spark-icon.png"),
  require("../../assets/images/nexons-icon.png"),
  require("../../assets/images/nestor-neutral.png"),
  require("../../assets/images/nestor-focused.png"),
  require("../../assets/images/nestor-happy.png"),
]

export function AssetPreloader() {
  useEffect(() => {
    void Asset.loadAsync(PRELOADED_APP_ASSETS).catch((error) => {
      console.warn("Failed to preload app assets:", error)
    })
  }, [])

  return null
}
