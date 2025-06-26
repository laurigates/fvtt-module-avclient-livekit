import LiveKitClient from "./LiveKitClient";
import { LANG_NAME, MODULE_NAME, TAVERN_AUTH_SERVER } from "./utils/constants";
import { delayReload, getGame, isVersion10AV } from "./utils/helpers";
import * as log from "./utils/logging";

export default class LiveKitAVConfig extends AVConfig {
  /** @override */
  static get defaultOptions() {
    // @ts-expect-error - FoundryVTT API
    return foundry.utils.mergeObject(super.defaultOptions || {}, {
      template: "modules/avclient-livekit/templates/av-config.html",
    });
  }

  _getLiveKitSettings() {
    const gs = getGame().settings;
    const canConfigure = getGame().user?.can("SETTINGS_MODIFY");

    const liveKitSettings = [];

    for (const setting of gs.settings.values()) {
      if (
        setting.namespace !== MODULE_NAME ||
        !setting.config ||
        (!canConfigure && setting.scope !== "client")
      )
        continue;

      // Update setting data
      // @ts-expect-error - FoundryVTT API
      const s: any = foundry.utils.deepClone(setting);
      s.id = `${setting.namespace}.${setting.key}`;
      s.name = getGame().i18n?.localize(setting.name || "") || "";
      s.hint = getGame().i18n?.localize(setting.hint || "") || "";
      // @ts-expect-error - FoundryVTT API
      s.value = getGame().settings.get(setting.namespace, setting.key);
      s.settingType =
        setting.type instanceof Function ? setting.type.name : "String";
      s.isCheckbox = setting.type === Boolean;
      s.isSelect = setting.choices !== undefined;
      s.isRange = setting.type === Number && setting.range;
      s.isNumber = setting.type === Number;
      // @ts-expect-error - FoundryVTT API property not in type definitions
      s.filePickerType = setting.filePicker === true ? "any" : setting.filePicker;

      liveKitSettings.push(s);
    }

    return liveKitSettings;
  }

  // @ts-expect-error - FoundryVTT API
  async getData(options: any = {}): Promise<Record<string, unknown>> {
    // @ts-expect-error - FoundryVTT API
    const data = await super.getData(options);
    // @ts-expect-error - FoundryVTT API
    return foundry.utils.mergeObject(data, {
      isVersion10AV: isVersion10AV(),
      liveKitServerTypes: getGame().webrtc?.client._liveKitClient?.liveKitServerTypes,
      liveKitSettings: this._getLiveKitSettings(),
      tavernAuthResponse: await this._patreonGetUserInfo(),
    });
  }

  /** @override */
  // @ts-expect-error - FoundryVTT API
  activateListeners(html: JQuery<HTMLElement>) {
    // @ts-expect-error - FoundryVTT API
    super.activateListeners(html);

    // Options below are GM only
    if (!getGame().user?.isGM) return;
    html
      .find('select[name="world.livekit.type"]')
      .on("change", this._onLiveKitTypeChanged.bind(this));

    const settings = (this as any).object.settings;
    const liveKitClient = getGame().webrtc?.client._liveKitClient;

    if (liveKitClient instanceof LiveKitClient) {
      const liveKitServerTypeKey = settings.get("world", "livekit.type");
      let liveKitServerType = liveKitClient.defaultLiveKitServerType;
      if (
        typeof liveKitServerTypeKey === "string" &&
        liveKitClient.liveKitServerTypes[liveKitServerTypeKey] !== undefined
      ) {
        liveKitServerType =
          liveKitClient.liveKitServerTypes[liveKitServerTypeKey];
      } else {
        log.warn(
          "liveKitServerType",
          liveKitServerTypeKey,
          "not found; defaulting to",
          liveKitClient.defaultLiveKitServerType.key
        );
      }

      this._setConfigSectionVisible(
        ".livekit-details",
        liveKitServerType.details !== undefined
      );
      if (liveKitServerType.details !== undefined) {
        this._setSectionParagraphHtml(
          ".livekit-details",
          getGame().i18n?.localize(liveKitServerType.details) || ""
        );
      }
      this._setConfigSectionVisible(
        ".livekit-url",
        liveKitServerType.urlRequired
      );
      this._setConfigSectionVisible(
        ".livekit-username",
        liveKitServerType.usernameRequired
      );
      this._setConfigSectionVisible(
        ".livekit-password",
        liveKitServerType.passwordRequired
      );
      this._setConfigSectionVisible(
        ".livekit-tavern-auth",
        liveKitServerTypeKey === "tavern"
      );

      // Tavern only
      if (liveKitServerTypeKey === "tavern") {
        const authServer =
          (getGame().webrtc?.client.settings.get(
            "world",
            "livekit.tavernAuthServer"
          ) as string) || TAVERN_AUTH_SERVER;
        const id = btoa(
          `{"host": "${window.location.hostname}", "world": "${
            getGame().world.id
          }"}`
        );
        html.find("#tavern-patreon-button").on("click", (clickEvent) => {
          clickEvent.preventDefault();
          window.addEventListener("message", this._patreonLoginListener, {
            once: true,
          });
          window.open(
            `${authServer}/auth/patreon?id=${id}`,
            undefined,
            "width=600,height=800"
          );
          html.find("#tavern-account-token").removeClass("hidden");
          (this as any).setPosition((this as any).position);
        });
        html.find("#tavern-logout-button").on("click", (clickEvent) => {
          clickEvent.preventDefault();
          this._patreonLogout();
        });
      }
    } else {
      log.warn("activateListeners: liveKitClient not yet available");
    }
  }

  _onLiveKitTypeChanged(event: JQuery.ChangeEvent) {
    event.preventDefault();
    const choice = event.currentTarget.value;
    const liveKitServerType =
      getGame().webrtc?.client._liveKitClient?.liveKitServerTypes[choice];
    const current = (this as any).object.settings.get("world", "livekit.type");

    if (!liveKitServerType) {
      log.warn("liveKitServerType", choice, "not found");
      return;
    }

    this._setConfigSectionVisible(
      ".livekit-details",
      liveKitServerType.details !== undefined
    );
    if (liveKitServerType.details !== undefined) {
      this._setSectionParagraphHtml(
        ".livekit-details",
        getGame().i18n?.localize(liveKitServerType.details) || ""
      );
    }
    this._setConfigSectionVisible(
      ".livekit-url",
      liveKitServerType.urlRequired
    );
    this._setConfigSectionVisible(
      ".livekit-username",
      liveKitServerType.usernameRequired
    );
    this._setConfigSectionVisible(
      ".livekit-password",
      liveKitServerType.passwordRequired
    );
    // We only set this if the selection was already Tavern,
    // otherwise a sign in may happen without saving the server selection
    this._setConfigSectionVisible(
      ".livekit-tavern-auth",
      choice === "tavern" && current === "tavern"
    );
  }

  _setConfigSectionVisible(selector: string, enabled = true) {
    const section = $((this as any).element).find(selector);
    if (section) {
      if (enabled) {
        section.show();
      } else {
        section.hide();
      }
    }
    (this as any).setPosition((this as any).position);
  }

  _setConfigSectionEditable(selector: string, enabled = true) {
    const section = $((this as any).element).find(selector);
    if (section) {
      section.css("opacity", enabled ? 1.0 : 0.5);
      section.find("input").prop("readonly", !enabled);
    }
  }

  _setConfigSectionValue(selector: string, value = "") {
    const section = $((this as any).element).find(selector);
    if (section) {
      section.find("input").val(value);
    }
  }

  _setSectionParagraphHtml(selector: string, value = "") {
    const section = $((this as any).element).find(selector);
    if (section) {
      section.find("p").html(value);
    }
  }

  async _patreonLogout() {
    // GM only
    if (!getGame().user?.isGM) return;
    const authServer =
      (getGame().webrtc?.client.settings.get(
        "world",
        "livekit.tavernAuthServer"
      ) as string) || TAVERN_AUTH_SERVER;
    const token = getGame().webrtc?.client.settings.get(
      "world",
      "livekit.tavernPatreonToken"
    ) as string;
    if (!token) return;
    const response = await fetch(`${authServer}/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: token }),
    });
    if (!response.ok) {
      ui.notifications?.error(`${LANG_NAME}.tavernAccountLogoutError`, {
        localize: true,
      });
      log.warn("Error signing out of Patreon account", response);
    }
    getGame().webrtc?.client.settings.set(
      "world",
      "livekit.tavernPatreonToken",
      ""
    );
    delayReload();
  }

  async _patreonLoginListener(messageEvent: MessageEvent) {
    // GM only
    if (!getGame().user?.isGM) return;
    const authServer =
      (getGame().webrtc?.client.settings.get(
        "world",
        "livekit.tavernAuthServer"
      ) as string) || TAVERN_AUTH_SERVER;
    if (messageEvent.origin !== authServer) return;

    messageEvent.preventDefault();
    getGame().webrtc?.client.settings.set(
      "world",
      "livekit.tavernPatreonToken",
      messageEvent.data.id
    );
    delayReload();
  }

  async _patreonGetUserInfo() {
    // GM only
    if (!getGame().user?.isGM) return;
    // Tavern only
    if ((this as any).object.settings.get("world", "livekit.type") !== "tavern") return;
    const authServer =
      (getGame().webrtc?.client.settings.get(
        "world",
        "livekit.tavernAuthServer"
      ) as string) || TAVERN_AUTH_SERVER;
    const token = getGame().webrtc?.client.settings.get(
      "world",
      "livekit.tavernPatreonToken"
    ) as string;
    if (!token) return;
    let response;
    try {
      response = await fetch(`${authServer}/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: token }),
      });
    } catch (e) {
      log.warn("Error validating Patreon account", e);
      return;
    }
    let responseJson;
    try {
      responseJson = await response.json();
    } catch (e) {
      log.warn("Error parsing response", e);
      return;
    }
    if (!response.ok) {
      log.error("Error validating Patreon account", responseJson);
    }
    return responseJson;
  }

  /** @override */
  async _updateObject(event: Event, formData: object) {
    // @ts-expect-error - FoundryVTT API
    for (const [k, v] of Object.entries(
      foundry.utils.flattenObject(formData)
    )) {
      const s = getGame().settings.settings.get(k);
      if (s?.namespace !== MODULE_NAME) continue;
      const current = getGame().settings.get(s.namespace, s.key);
      if (v === current) continue;
      // @ts-expect-error - FoundryVTT API
      await getGame().settings.set(s.namespace, s.key, v);
    }

    // @ts-expect-error - FoundryVTT API
    await super._updateObject(event, formData);
  }
}
