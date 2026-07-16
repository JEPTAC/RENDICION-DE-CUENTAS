(() => {
  "use strict";

  const BUILD = "11.17-scroll-gubernamental";
  const STORE_KEY = "sp_connected_experience_v1";

  const DEFAULT_CONFIG = Object.freeze({
    networkTitle:"San Pedro conectado",
    networkLead:
      "Barrios, corregimientos, veredas y gestión pública visibles como una sola red territorial.",
    compareTitle:"Transformación visible",
    compareLocation:"San Pedro, Valle del Cauca",
    compareBefore:"",
    compareAfter:"",
    compareBeforeLabel:"Antes",
    compareAfterLabel:"Después",
    compareCaption:
      "Agregue fotografías institucionales para comparar el estado inicial y el resultado.",
    evidenceUrl:"",
    updatedAt:""
  });

  const state = {
    initialized:false,
    root:null,
    route:null,
    closing:null,
    canvas:null,
    context:null,
    networkStage:null,
    nodes:[],
    activeNode:null,
    filter:"all",
    frame:0,
    visible:false,
    routeObserver:null,
    networkObserver:null,
    resizeObserver:null,
    pointer:{x:.5,y:.5},
    time:0,
    config:null,
    sphere:{
      rotX:-0.18,
      rotY:0.24,
      targetX:-0.18,
      targetY:0.24,
      dragging:false,
      pointerId:null,
      lastX:0,
      lastY:0,
      velocityX:0,
      velocityY:0,
      spin:0.00115,
      zoom:1,
      targetZoom:1,
      autoRotate:true,
      lastInteraction:0
    },
    adminDialog:null,
    compareValue:50,
    data:null,
    villageTexture:null
  };

  const portal = () => window.Portal;
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );
  const finePointer = window.matchMedia(
    "(hover:hover) and (pointer:fine)"
  );

  function isHome() {
    const file = (location.pathname.split("/").pop() || "index.html")
      .toLowerCase();
    return (
      file === "" ||
      file === "index.html" ||
      document.body?.classList.contains("page-home") ||
      document.body?.dataset?.page === "home"
    );
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g,char => ({
      "&":"&amp;",
      "<":"&lt;",
      ">":"&gt;",
      '"':"&quot;",
      "'":"&#039;"
    })[char]);
  }

  function isAdmin() {
    const key = portal()?.KEYS?.admin || "sp_v6_admin";
    return Boolean(
      portal()?.state?.admin ||
      sessionStorage.getItem(key) === "1" ||
      window.FirebasePortal?.getStatus?.()?.canWrite
    );
  }

  function defaultConfig() {
    return {...DEFAULT_CONFIG};
  }

  function getConfigStore() {
    const content = portal()?.state?.content;
    if (content) {
      if (
        !content.sanPedroConnected ||
        typeof content.sanPedroConnected !== "object"
      ) {
        content.sanPedroConnected = defaultConfig();
      }
      return content.sanPedroConnected;
    }

    try {
      return {
        ...defaultConfig(),
        ...JSON.parse(localStorage.getItem(STORE_KEY) || "{}")
      };
    } catch {
      return defaultConfig();
    }
  }

  function persistConfig() {
    state.config.updatedAt = new Date().toISOString();

    if (portal()?.state?.content) {
      portal()?.helpers?.save?.();
      window.dispatchEvent(new CustomEvent("portal:datachange"));
    } else {
      localStorage.setItem(STORE_KEY,JSON.stringify(state.config));
    }
  }

  function getTerritoryData() {
    const external = window.TerritoryExperience?.getData?.();
    if (external) return external;

    return {
      center:{lat:3.99557,lng:-76.22805},
      territory:[
        {
          id:"cabecera",
          name:"Cabecera municipal",
          kind:"Casco urbano",
          lat:3.99557,
          lng:-76.22805
        }
      ],
      neighborhoods:[],
      records:[]
    };
  }

  function createNodeLayout(data) {
    const cabecera =
      data.territory.find(item => item.id === "cabecera") ||
      data.territory[0];

    const neighborhoods = [...data.neighborhoods].sort((a,b) =>
      String(a.name || "").localeCompare(String(b.name || ""),"es")
    );
    const rural = data.territory
      .filter(item => item.id !== cabecera?.id)
      .sort((a,b) =>
        String(a.name || "").localeCompare(String(b.name || ""),"es")
      );

    const combined = [];
    const longest = Math.max(neighborhoods.length,rural.length);
    for (let index = 0; index < longest; index += 1) {
      if (index < neighborhoods.length) {
        combined.push({...neighborhoods[index],group:"neighborhood"});
      }
      if (index < rural.length) {
        combined.push({...rural[index],group:"rural"});
      }
    }

    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const surface = combined.map((item,index,array) => {
      const total = Math.max(array.length,1);
      const y = 1 - 2 * ((index + .5) / total);
      const radial = Math.sqrt(Math.max(0,1 - y * y));
      const angle = index * goldenAngle + .58;
      const x = Math.cos(angle) * radial;
      const z = Math.sin(angle) * radial;
      const lat = Math.asin(y);
      const lon = Math.atan2(x,z);

      return {
        ...item,
        sphereLat:lat,
        sphereLon:lon,
        sphereX:x,
        sphereY:y,
        sphereZ:z
      };
    });

    const center = cabecera
      ? [{
          ...cabecera,
          group:"center",
          sphereLat:0,
          sphereLon:0,
          sphereX:0,
          sphereY:0,
          sphereZ:1
        }]
      : [];

    return [...center,...surface];
  }

  function createTerritoryAtlas(nodes = []) {
    let seed = 2026071602;
    const random = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const range = (min,max) => min + (max - min) * random();
    const clamp = (value,min,max) => Math.max(min,Math.min(max,value));
    const normalizeLon = value => {
      while (value > Math.PI) value -= Math.PI * 2;
      while (value < -Math.PI) value += Math.PI * 2;
      return value;
    };

    function nodePoint(node) {
      return {
        lat:Number.isFinite(node?.sphereLat) ? node.sphereLat : 0,
        lon:Number.isFinite(node?.sphereLon) ? node.sphereLon : 0
      };
    }

    function ring(lat,lon,radius,vertices = 22,roughness = .22) {
      return Array.from({length:vertices + 1},(_,index) => {
        const angle = index / vertices * Math.PI * 2;
        const variation = 1 + Math.sin(index * 2.7 + lat * 5) * roughness * .35 +
          Math.cos(index * 1.35 + lon * 3) * roughness * .22;
        const localRadius = radius * variation;
        return {
          lat:clamp(lat + Math.sin(angle) * localRadius,-1.42,1.42),
          lon:normalizeLon(
            lon + Math.cos(angle) * localRadius /
            Math.max(.34,Math.cos(lat))
          )
        };
      });
    }

    function greatCirclePath(from,to,steps = 34) {
      const vector = point => {
        const cosLat = Math.cos(point.lat);
        return {
          x:Math.sin(point.lon) * cosLat,
          y:Math.sin(point.lat),
          z:Math.cos(point.lon) * cosLat
        };
      };
      const a = vector(from);
      const b = vector(to);
      const dot = clamp(a.x*b.x + a.y*b.y + a.z*b.z,-1,1);
      const omega = Math.acos(dot);
      const sinOmega = Math.sin(omega);
      return Array.from({length:steps},(_,index) => {
        const t = index / (steps - 1);
        let x,y,z;
        if (sinOmega < .00001) {
          x = a.x + (b.x - a.x) * t;
          y = a.y + (b.y - a.y) * t;
          z = a.z + (b.z - a.z) * t;
        } else {
          const wa = Math.sin((1-t)*omega) / sinOmega;
          const wb = Math.sin(t*omega) / sinOmega;
          x = a.x*wa + b.x*wb;
          y = a.y*wa + b.y*wb;
          z = a.z*wa + b.z*wb;
        }
        return {
          lat:Math.asin(clamp(y,-1,1)),
          lon:Math.atan2(x,z)
        };
      });
    }

    const centerNode = nodes.find(node => node.group === 'center') || {
      sphereLat:0,
      sphereLon:0,
      group:'center',
      name:'Cabecera municipal'
    };
    const center = nodePoint(centerNode);
    const surfaceNodes = nodes.filter(node => node.group !== 'center');

    const zones = [centerNode,...surfaceNodes].map((node,index) => {
      const point = nodePoint(node);
      const radius = node.group === 'center'
        ? .23
        : node.group === 'neighborhood'
          ? range(.115,.155)
          : range(.16,.215);
      return {
        id:node.id,
        name:node.name,
        group:node.group,
        lat:point.lat,
        lon:point.lon,
        radius,
        polygon:ring(point.lat,point.lon,radius,24,node.group === 'rural' ? .34 : .22),
        tone:index % 5
      };
    });

    const parcels = [];
    const forests = [];
    const buildings = [];
    const mountains = [];
    const localRoads = [];
    const contours = [];

    zones.forEach((zone,zoneIndex) => {
      const parcelCount = zone.group === 'rural' ? 5 : zone.group === 'center' ? 6 : 3;
      for (let index = 0; index < parcelCount; index += 1) {
        const angle = range(0,Math.PI * 2);
        const distance = zone.radius * range(.18,.68);
        const lat = clamp(zone.lat + Math.sin(angle)*distance,-1.38,1.38);
        const lon = normalizeLon(zone.lon + Math.cos(angle)*distance/Math.max(.36,Math.cos(zone.lat)));
        parcels.push({
          group:zone.group,
          tone:(zoneIndex + index) % 6,
          polygon:ring(lat,lon,zone.radius*range(.12,.25),8,.12)
        });
      }

      if (zone.group === 'rural') {
        for (let index = 0; index < 5; index += 1) {
          const angle = range(0,Math.PI * 2);
          const distance = zone.radius * range(.15,.72);
          forests.push({
            lat:clamp(zone.lat + Math.sin(angle)*distance,-1.38,1.38),
            lon:normalizeLon(zone.lon + Math.cos(angle)*distance/Math.max(.36,Math.cos(zone.lat))),
            size:range(1.5,3.4),
            tone:index % 3
          });
        }
        if (zoneIndex % 2 === 0) {
          mountains.push({
            lat:clamp(zone.lat + range(-.07,.07),-1.34,1.34),
            lon:normalizeLon(zone.lon + range(-.07,.07)),
            size:range(4.2,7.2),
            angle:range(-Math.PI,Math.PI),
            tone:zoneIndex % 3
          });
        }
      } else {
        const buildingCount = zone.group === 'center' ? 12 : 4;
        for (let index = 0; index < buildingCount; index += 1) {
          const angle = range(0,Math.PI * 2);
          const distance = zone.radius * range(.08,.58);
          buildings.push({
            lat:clamp(zone.lat + Math.sin(angle)*distance,-1.38,1.38),
            lon:normalizeLon(zone.lon + Math.cos(angle)*distance/Math.max(.36,Math.cos(zone.lat))),
            size:range(1.4,2.8),
            angle:range(-Math.PI,Math.PI),
            tone:index % 4,
            light:random() > .42
          });
        }
      }

      contours.push(ring(zone.lat,zone.lon,zone.radius*.72,32,.06));
      if (zone.group === 'rural') {
        contours.push(ring(zone.lat,zone.lon,zone.radius*.48,28,.05));
      }
    });

    const routes = surfaceNodes.map((node,index) => ({
      group:node.group,
      primary:index % 4 === 0,
      path:greatCirclePath(center,nodePoint(node),30)
    }));

    surfaceNodes
      .filter(node => node.group === 'neighborhood')
      .forEach((node,index,array) => {
        const next = array[(index + 1) % array.length];
        if (next) {
          localRoads.push(greatCirclePath(nodePoint(node),nodePoint(next),18));
        }
      });

    const rivers = [
      Array.from({length:64},(_,index) => {
        const progress = index / 63;
        return {
          lat:-.58 + progress*1.12 + Math.sin(progress*Math.PI*4.2)*.075,
          lon:-2.75 + progress*5.5 + Math.sin(progress*Math.PI*2.6)*.12
        };
      }),
      Array.from({length:46},(_,index) => {
        const progress = index / 45;
        return {
          lat:.48 - progress*.86 + Math.sin(progress*Math.PI*3.5)*.055,
          lon:-1.9 + progress*3.8
        };
      })
    ];

    const clouds = Array.from({length:14},(_,index) => ({
      lat:range(-.92,.92),
      lon:range(-Math.PI,Math.PI),
      size:range(12,24),
      squash:range(.46,.68),
      angle:range(-Math.PI,Math.PI),
      alpha:range(.07,.15),
      tone:index % 3
    }));

    const stars = Array.from({length:72},() => ({
      x:random(),
      y:random(),
      size:range(.35,1.35),
      alpha:range(.10,.45),
      phase:range(0,Math.PI*2)
    }));

    return {
      center,
      zones,
      parcels,
      forests,
      buildings,
      mountains,
      contours,
      routes,
      localRoads,
      rivers,
      clouds,
      stars
    };
  }

  function sphereGeometry(rect) {
    const compact = rect.width < 620;
    const zoom = state.sphere.zoom || 1;
    return {
      centerX:rect.width * .5,
      centerY:rect.height * (compact ? .48 : .495),
      radius:Math.min(rect.width,rect.height) * (compact ? .365 : .395) * zoom
    };
  }

  function rotatedPointAt(node,offsetY = 0,offsetX = 0) {
    const rotY = state.sphere.rotY + offsetY;
    const rotX = state.sphere.rotX + offsetX;
    const x1 = node.sphereX * Math.cos(rotY) + node.sphereZ * Math.sin(rotY);
    const z1 = -node.sphereX * Math.sin(rotY) + node.sphereZ * Math.cos(rotY);
    const y2 = node.sphereY * Math.cos(rotX) - z1 * Math.sin(rotX);
    const z2 = node.sphereY * Math.sin(rotX) + z1 * Math.cos(rotX);
    return {x:x1,y:y2,z:z2};
  }

  function projectTexturePoint(lat,lon,rect,{offsetY = 0,offsetX = 0,altitude = 0} = {}) {
    const cosLat = Math.cos(lat);
    const rotated = rotatedPointAt({
      sphereX:Math.sin(lon) * cosLat,
      sphereY:Math.sin(lat),
      sphereZ:Math.cos(lon) * cosLat
    },offsetY,offsetX);
    const geometry = sphereGeometry(rect);
    const perspective = .68 + (rotated.z + 1) * .27;
    const elevatedRadius = geometry.radius * (1 + altitude);
    return {
      ...rotated,
      x:geometry.centerX + rotated.x * elevatedRadius * perspective,
      y:geometry.centerY + rotated.y * elevatedRadius * .93 * perspective,
      scale:.56 + perspective * .49,
      visible:rotated.z > .018,
      geometry
    };
  }

  function drawTexturePath(ctx,path,rect,color,width,options = {}) {
    let started = false;
    ctx.beginPath();
    path.forEach(point => {
      const projected = projectTexturePoint(
        point.lat,
        point.lon,
        rect,
        options
      );
      if (!projected.visible) {
        started = false;
        return;
      }
      if (!started) {
        ctx.moveTo(projected.x,projected.y);
        started = true;
      } else {
        ctx.lineTo(projected.x,projected.y);
      }
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  }

  function drawTexturePolygon(ctx,polygon,rect,fill,stroke,options = {}) {
    const projected = polygon.map(point => projectTexturePoint(
      point.lat,
      point.lon,
      rect,
      options
    ));
    const visible = projected.filter(point => point.visible);
    if (visible.length < Math.max(4,projected.length*.58)) return;

    ctx.beginPath();
    let started = false;
    projected.forEach(point => {
      if (!point.visible) return;
      if (!started) {
        ctx.moveTo(point.x,point.y);
        started = true;
      } else {
        ctx.lineTo(point.x,point.y);
      }
    });
    ctx.closePath();
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = options.lineWidth || .8;
      ctx.stroke();
    }
  }

  function drawPlanetBackdrop(ctx,rect) {
    const texture = state.villageTexture;
    if (!texture) return;
    const geometry = sphereGeometry(rect);

    texture.stars.forEach((star,index) => {
      const x = star.x * rect.width;
      const y = star.y * rect.height;
      const distance = Math.hypot(x - geometry.centerX,y - geometry.centerY);
      if (distance < geometry.radius * 1.12) return;
      const twinkle = reducedMotion.matches
        ? 1
        : .72 + Math.sin(state.time * .0012 + star.phase + index) * .28;
      ctx.beginPath();
      ctx.fillStyle = `rgba(210,235,255,${star.alpha * twinkle})`;
      ctx.arc(x,y,star.size,0,Math.PI * 2);
      ctx.fill();
    });

    ctx.save();
    ctx.translate(geometry.centerX,geometry.centerY + geometry.radius * 1.03);
    ctx.scale(1,.20);
    const shadow = ctx.createRadialGradient(0,0,8,0,0,geometry.radius * .92);
    shadow.addColorStop(0,'rgba(0,0,0,.42)');
    shadow.addColorStop(.58,'rgba(0,0,0,.16)');
    shadow.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle = shadow;
    ctx.beginPath();
    ctx.arc(0,0,geometry.radius * .92,0,Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawPlanetSurface(ctx,rect) {
    const atlas = state.villageTexture;
    if (!atlas) return;

    const zoneFill = {
      center:'rgba(228,205,125,.72)',
      neighborhood:'rgba(114,145,178,.68)',
      rural:'rgba(87,139,92,.72)'
    };
    const zoneEdge = {
      center:'rgba(255,239,180,.62)',
      neighborhood:'rgba(185,211,230,.42)',
      rural:'rgba(184,218,157,.46)'
    };
    const parcelFills = [
      'rgba(202,184,111,.23)',
      'rgba(119,158,91,.25)',
      'rgba(185,151,88,.21)',
      'rgba(93,139,105,.24)',
      'rgba(209,196,133,.18)',
      'rgba(139,171,109,.22)'
    ];

    atlas.zones.forEach(zone => {
      drawTexturePolygon(
        ctx,
        zone.polygon,
        rect,
        zoneFill[zone.group],
        zoneEdge[zone.group],
        {lineWidth:zone.group === 'center' ? 1.4 : .9}
      );
    });

    atlas.parcels.forEach(parcel => {
      drawTexturePolygon(
        ctx,
        parcel.polygon,
        rect,
        parcelFills[parcel.tone],
        'rgba(239,229,188,.14)',
        {lineWidth:.45}
      );
    });

    atlas.contours.forEach((contour,index) => {
      drawTexturePath(
        ctx,
        contour,
        rect,
        index % 2
          ? 'rgba(229,238,204,.10)'
          : 'rgba(35,83,65,.14)',
        .52
      );
    });

    atlas.forests.forEach(tree => {
      const point = projectTexturePoint(tree.lat,tree.lon,rect,{altitude:.003});
      if (!point.visible || point.z < .06) return;
      const size = tree.size * point.scale;
      ctx.beginPath();
      ctx.fillStyle = [
        'rgba(24,87,57,.62)',
        'rgba(38,107,65,.58)',
        'rgba(54,121,75,.54)'
      ][tree.tone];
      ctx.arc(point.x,point.y,size,0,Math.PI*2);
      ctx.fill();
    });

    atlas.mountains.forEach(mountain => {
      const point = projectTexturePoint(
        mountain.lat,
        mountain.lon,
        rect,
        {altitude:.007}
      );
      if (!point.visible || point.z < .08) return;
      const size = mountain.size * point.scale;
      ctx.save();
      ctx.translate(point.x,point.y);
      ctx.rotate(mountain.angle + state.sphere.rotY*.08);
      ctx.beginPath();
      ctx.moveTo(-size,size*.58);
      ctx.lineTo(0,-size);
      ctx.lineTo(size,size*.58);
      ctx.closePath();
      ctx.fillStyle = [
        'rgba(111,112,86,.50)',
        'rgba(130,119,88,.46)',
        'rgba(82,107,89,.48)'
      ][mountain.tone];
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0,-size);
      ctx.lineTo(size,size*.58);
      ctx.lineTo(size*.18,size*.25);
      ctx.closePath();
      ctx.fillStyle = 'rgba(20,35,38,.28)';
      ctx.fill();
      ctx.restore();
    });

    atlas.routes.forEach(route => {
      drawTexturePath(
        ctx,
        route.path,
        rect,
        'rgba(28,54,64,.36)',
        route.primary ? 3.8 : 2.5
      );
      drawTexturePath(
        ctx,
        route.path,
        rect,
        route.group === 'neighborhood'
          ? 'rgba(249,221,156,.62)'
          : 'rgba(233,210,154,.48)',
        route.primary ? 2.2 : 1.35
      );
    });

    atlas.localRoads.forEach(path => {
      drawTexturePath(
        ctx,
        path,
        rect,
        'rgba(242,231,199,.32)',
        .9
      );
    });

    atlas.rivers.forEach((river,index) => {
      drawTexturePath(
        ctx,
        river,
        rect,
        index === 0
          ? 'rgba(91,215,239,.62)'
          : 'rgba(86,191,226,.42)',
        index === 0 ? 2.4 : 1.45
      );
    });

    atlas.buildings.forEach(building => {
      const point = projectTexturePoint(
        building.lat,
        building.lon,
        rect,
        {altitude:.009}
      );
      if (!point.visible || point.z < .12) return;
      const size = building.size * point.scale;
      const walls = [
        'rgba(244,238,220,.80)',
        'rgba(218,229,218,.72)',
        'rgba(239,219,188,.74)',
        'rgba(220,228,236,.72)'
      ];
      const roofs = [
        'rgba(174,70,49,.82)',
        'rgba(190,105,49,.78)',
        'rgba(142,65,55,.76)',
        'rgba(105,83,68,.72)'
      ];
      ctx.save();
      ctx.translate(point.x,point.y);
      ctx.rotate(building.angle + state.sphere.rotY*.08);
      ctx.shadowColor = 'rgba(0,0,0,.26)';
      ctx.shadowBlur = 2.2;
      ctx.shadowOffsetY = 1.5;
      ctx.fillStyle = walls[building.tone];
      ctx.fillRect(-size,-size*.55,size*2,size*1.1);
      ctx.beginPath();
      ctx.moveTo(-size*1.12,-size*.55);
      ctx.lineTo(0,-size*1.38);
      ctx.lineTo(size*1.12,-size*.55);
      ctx.closePath();
      ctx.fillStyle = roofs[building.tone];
      ctx.fill();
      if (building.light) {
        ctx.fillStyle = 'rgba(255,221,134,.84)';
        ctx.fillRect(-size*.35,-size*.12,size*.27,size*.27);
      }
      ctx.restore();
    });

    const centerPoint = projectTexturePoint(
      atlas.center.lat,
      atlas.center.lon,
      rect,
      {altitude:.012}
    );
    if (centerPoint.visible && centerPoint.z > .10) {
      ctx.save();
      ctx.translate(centerPoint.x,centerPoint.y);
      ctx.fillStyle = 'rgba(255,247,214,.88)';
      ctx.font = `900 ${Math.max(8,10*centerPoint.scale)}px "Century Gothic", Arial`;
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,.40)';
      ctx.shadowBlur = 4;
      ctx.fillText('SAN PEDRO',0,-12*centerPoint.scale);
      ctx.restore();
    }
  }

  function drawCloudLayer(ctx,rect) {
    const texture = state.villageTexture;
    if (!texture) return;
    const offset = reducedMotion.matches ? 0 : state.time * .000018;
    texture.clouds.forEach(cloud => {
      const point = projectTexturePoint(cloud.lat,cloud.lon,rect,{
        offsetY:offset,
        altitude:.018
      });
      if (!point.visible || point.z < .04) return;
      ctx.save();
      ctx.translate(point.x,point.y);
      ctx.rotate(cloud.angle + offset * .4);
      ctx.scale(1,cloud.squash);
      ctx.globalAlpha = cloud.alpha;
      const gradient = ctx.createRadialGradient(0,0,1,0,0,cloud.size * point.scale);
      gradient.addColorStop(0,'rgba(247,252,255,.78)');
      gradient.addColorStop(.55,'rgba(211,236,247,.42)');
      gradient.addColorStop(1,'rgba(178,214,232,0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.ellipse(0,0,cloud.size * point.scale,cloud.size * .62 * point.scale,0,0,Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    ctx.globalAlpha = 1;
  }

  function metricMarkup(data) {
    return `
      <article>
        <small>Barrios</small>
        <strong>${data.neighborhoods.length}</strong>
      </article>
      <article>
        <small>Corregimientos</small>
        <strong>${Math.max(0,data.territory.length - 1)}</strong>
      </article>
      <article>
        <small>Registros de gestión</small>
        <strong>${data.records.length}</strong>
      </article>`;
  }

  function featureCards() {
    return [
      {
        key:"territory",
        index:"01",
        eyebrow:"TERRITORIO",
        title:"Cada lugar tiene una historia",
        text:
          "Barrios, corregimientos y veredas se conectan con resultados, necesidades y evidencias.",
        action:"Explorar la red",
        icon:"◎"
      },
      {
        key:"investment",
        index:"02",
        eyebrow:"INVERSIÓN",
        title:"Del presupuesto al territorio",
        text:
          "La información puede seguirse desde el recurso asignado hasta la población beneficiada.",
        action:"Seguir la ruta",
        icon:"↗"
      },
      {
        key:"participation",
        index:"03",
        eyebrow:"PARTICIPACIÓN",
        title:"La comunidad también conecta",
        text:
          "Ideas, reportes y espacios de diálogo pueden vincularse con cada sector del municipio.",
        action:"Conocer el proceso",
        icon:"✦"
      },
      {
        key:"evidence",
        index:"04",
        eyebrow:"EVIDENCIA",
        title:"Resultados que se pueden verificar",
        text:
          "Fotografías, documentos, avances y compromisos completan el recorrido público.",
        action:"Ver transformación",
        icon:"✓"
      }
    ];
  }

  function createSections() {
    if (document.querySelector("#sanPedroConnected")) {
      state.root = document.querySelector("#sanPedroConnected");
      state.route = document.querySelector("#connectedRoute");
      state.closing = document.querySelector("#connectedClosing");
      return;
    }

    const data = state.data;
    const config = state.config;
    const nodes = createNodeLayout(data);
    state.nodes = nodes;

    const network = document.createElement("section");
    network.id = "sanPedroConnected";
    network.className = "connected-experience";
    network.innerHTML = `
      <div class="connected-shell">
        <header class="connected-heading connected-heading--premium">
          <div class="connected-title-block">
            <span>EXPERIENCIA TERRITORIAL</span>
            <h2>${escapeHtml(config.networkTitle)}</h2>
            <div class="connected-title-summary">
              <article>
                <small>PUNTOS VISIBLES</small>
                <strong>${nodes.length}</strong>
                <p>Entre cabecera, barrios y corregimientos.</p>
              </article>
              <article>
                <small>INTERACCIÓN</small>
                <strong>Gire, seleccione y abra el mapa</strong>
                <p>La esfera responde al arrastre y orienta cada punto al frente.</p>
              </article>
            </div>
          </div>

          <div class="connected-intro-panel">
            <article class="connected-intro-card">
              <small>01 · ORIENTACIÓN</small>
              <strong>Una esfera para leer mejor el territorio</strong>
              <p>La visual organiza la cabecera, los barrios y los corregimientos como una sola red navegable.</p>
            </article>
            <article class="connected-intro-card">
              <small>02 · ACCIÓN</small>
              <strong>Seleccione un punto o gire manualmente</strong>
              <p>Puede usar el modelo interactivo o la barra lateral para llevar cada lugar al frente.</p>
            </article>
            <article class="connected-intro-card">
              <small>03 · CONTINUIDAD</small>
              <strong>Salte al mapa real cuando lo necesite</strong>
              <p>La experiencia inmersiva no reemplaza el mapa: lo complementa y lo hace más entendible.</p>
            </article>
          </div>

          <div class="connected-heading-actions">
            <button
              type="button"
              class="connected-admin-button"
              id="connectedAdminButton"
              hidden
            >
              Gestionar experiencia
            </button>
          </div>
        </header>

        <div class="connected-network-layout connected-network-layout--rich">
          <div class="connected-network-stage connected-network-stage--globe" id="connectedNetworkStage">
            <canvas id="connectedNetworkCanvas" aria-hidden="true"></canvas>

            <div class="connected-stage-copy">
              <span>RED TERRITORIAL</span>
              <strong>Atlas territorial de San Pedro</strong>
              <small>Un mapa municipal envolvente: gire, filtre y explore cada lugar.</small>
            </div>

            <div class="connected-stage-legend">
              <span><i class="is-center"></i> Cabecera</span>
              <span><i class="is-neighborhood"></i> Barrios</span>
              <span><i class="is-rural"></i> Corregimientos</span>
            </div>

            <div class="connected-sphere-hint">
              <b>↺</b>
              <span>Arrastre el atlas o seleccione un lugar.</span>
            </div>

            <div class="connected-render-status" aria-hidden="true">
              <i></i>
              <span id="connectedFilterStatus">ATLAS COMPLETO</span>
              <b>MAPA 3D</b>
            </div>

            <div class="connected-sphere-controls" aria-label="Controles de la esfera">
              <button type="button" id="connectedSphereZoomIn" aria-label="Acercar esfera">+</button>
              <button type="button" id="connectedSphereZoomOut" aria-label="Alejar esfera">−</button>
              <button type="button" id="connectedSphereReset" aria-label="Restablecer orientación">⌂</button>
              <button type="button" id="connectedSphereAuto" class="active" aria-pressed="true" aria-label="Activar o desactivar rotación automática">↻</button>
            </div>

            <div class="connected-network-nodes">
              ${nodes.map((node,index) => `
                <button
                  type="button"
                  class="connected-node is-${node.group}"
                  data-connected-node="${escapeHtml(node.id)}"
                  data-connected-group="${node.group}"
                  data-connected-order="${index}"
                  aria-label="Abrir ${escapeHtml(node.name)}"
                >
                  <i>${node.group === "neighborhood"
                    ? "B"
                    : node.group === "center"
                      ? "SP"
                      : "●"}</i>
                  <span>${escapeHtml(node.name)}</span>
                </button>`).join("")}
            </div>

            <div class="connected-network-toolbar">
              <button type="button" class="active" data-connected-filter="all">Todo</button>
              <button type="button" data-connected-filter="neighborhood">Barrios</button>
              <button type="button" data-connected-filter="rural">Corregimientos</button>
            </div>
          </div>

          <aside class="connected-detail-panel connected-detail-panel--rich">
            <div class="connected-detail-status">
              <i></i>
              <span>Red territorial activa</span>
            </div>

            <div class="connected-detail-copy">
              <span id="connectedDetailEyebrow">SAN PEDRO</span>
              <h3 id="connectedDetailTitle">Seleccione un territorio</h3>
              <p id="connectedDetailText">La red permite recorrer la cabecera, los barrios y los corregimientos sin sustituir el mapa real.</p>
              <div id="connectedDetailMeta"></div>
            </div>

            <div class="connected-detail-facts" id="connectedDetailFacts">
              <article><small>Nivel</small><strong>Red territorial</strong></article>
              <article><small>Relación</small><strong>Centro, urbano y rural</strong></article>
              <article><small>Acción</small><strong>Seleccione un nodo</strong></article>
            </div>

            <div class="connected-detail-read">
              <small>LECTURA RÁPIDA</small>
              <p id="connectedDetailSupport">Use los filtros, seleccione un punto y luego abra su ubicación en el mapa para continuar la navegación.</p>
            </div>

            <button type="button" class="connected-map-link" id="connectedMapLink" disabled>
              Ver ubicación en el mapa
              <b aria-hidden="true">↗</b>
            </button>

            <div class="connected-location-picker">
              <div class="connected-location-picker-head">
                <small>SELECCIÓN RÁPIDA</small>
                <strong>Barra lateral de lugares</strong>
              </div>
              <div class="connected-location-list" id="connectedLocationList">
                <section class="connected-location-group" data-picker-section="center">
                  <header><span>Cabecera</span><b>1</b></header>
                  ${nodes.filter(node => node.group === "center").map(node => `
                    <button type="button" class="connected-location-item" data-connected-pick="${escapeHtml(node.id)}" data-connected-group="${node.group}">
                      <i class="is-${node.group}"></i>
                      <span>${escapeHtml(node.name)}</span>
                    </button>`).join("")}
                </section>
                <section class="connected-location-group" data-picker-section="neighborhood">
                  <header><span>Barrios</span><b>${nodes.filter(node => node.group === "neighborhood").length}</b></header>
                  ${nodes.filter(node => node.group === "neighborhood").map(node => `
                    <button type="button" class="connected-location-item" data-connected-pick="${escapeHtml(node.id)}" data-connected-group="${node.group}">
                      <i class="is-${node.group}"></i>
                      <span>${escapeHtml(node.name)}</span>
                    </button>`).join("")}
                </section>
                <section class="connected-location-group" data-picker-section="rural">
                  <header><span>Corregimientos</span><b>${nodes.filter(node => node.group === "rural").length}</b></header>
                  ${nodes.filter(node => node.group === "rural").map(node => `
                    <button type="button" class="connected-location-item" data-connected-pick="${escapeHtml(node.id)}" data-connected-group="${node.group}">
                      <i class="is-${node.group}"></i>
                      <span>${escapeHtml(node.name)}</span>
                    </button>`).join("")}
                </section>
              </div>
            </div>

            <div class="connected-network-metrics">
              ${metricMarkup(data)}
            </div>
          </aside>
        </div>

        <div class="connected-atlas-strip">
          <span><i class="is-map"></i><b>Mapa municipal 3D</b> con zonas, vías y relieve.</span>
          <span><i class="is-filter"></i><b>Filtros funcionales</b> para barrios y corregimientos.</span>
          <span><i class="is-route"></i><b>Conexión directa</b> con el mapa cartográfico real.</span>
        </div>

        <div class="connected-feature-grid connected-feature-grid--rich">
          ${featureCards().map(card => `
            <article class="connected-feature-card" data-connected-feature="${card.key}" tabindex="0">
              <div class="connected-feature-top">
                <span>${card.index}</span>
                <i>${card.icon}</i>
              </div>
              <small>${card.eyebrow}</small>
              <h3>${card.title}</h3>
              <p>${card.text}</p>
              <button type="button" tabindex="-1">${card.action} <b>↗</b></button>
            </article>`).join("")}
        </div>
      </div>
    `;

    const route = document.createElement("section");
    route.id = "connectedRoute";
    route.className = "connected-route gov-investment-route";
    route.innerHTML = `
      <div class="connected-shell gov-investment-shell">
        <header class="connected-heading connected-heading--light gov-investment-heading">
          <div>
            <span>RUTA DE LA INVERSIÓN PÚBLICA</span>
            <h2>De la prioridad territorial al resultado ciudadano</h2>
          </div>
          <p>
            Una secuencia clara para comprender cómo una necesidad se convierte
            en planeación, ejecución, seguimiento y evidencia pública.
          </p>
        </header>

        <div class="connected-route-layout gov-investment-layout">
          <aside class="connected-route-visual gov-investment-visual">
            <div class="gov-investment-topline">
              <span>FLUJO INSTITUCIONAL</span>
              <strong>GESTIÓN · DESARROLLO · RESULTADO</strong>
            </div>

            <div class="gov-investment-map">
              <svg viewBox="0 0 640 470" role="presentation" aria-hidden="true">
                <defs>
                  <linearGradient id="govRouteGradient" x1="0" x2="1">
                    <stop offset="0" stop-color="#39a7e1" />
                    <stop offset=".55" stop-color="#1b77bd" />
                    <stop offset="1" stop-color="#48c998" />
                  </linearGradient>
                </defs>
                <path
                  class="gov-investment-boundary"
                  d="M93 80C153 35 222 48 275 70C330 94 380 54 442 82C512 113 553 174 538 240C524 301 483 353 421 369C355 386 314 420 246 402C176 384 126 339 95 286C65 235 44 117 93 80Z"
                />
                <path class="gov-investment-contour contour-a" d="M112 142C182 116 237 130 295 163C359 200 420 194 503 150" />
                <path class="gov-investment-contour contour-b" d="M112 323C168 292 215 266 284 267C361 269 421 317 501 285" />
                <path
                  class="gov-investment-main-path"
                  pathLength="100"
                  d="M119 327C171 295 175 218 239 193C298 170 329 230 388 218C447 206 461 137 520 125"
                />
                <g class="gov-investment-map-nodes">
                  <circle data-route-map-node="0" cx="119" cy="327" r="13" />
                  <circle data-route-map-node="1" cx="239" cy="193" r="13" />
                  <circle data-route-map-node="2" cx="388" cy="218" r="13" />
                  <circle data-route-map-node="3" cx="520" cy="125" r="13" />
                </g>
              </svg>

              <div class="gov-investment-stage-card">
                <div>
                  <small id="connectedRouteNumber">01</small>
                  <span>ETAPA ACTIVA</span>
                </div>
                <strong id="connectedRouteTitle">Prioridad territorial</strong>
                <p id="connectedRouteCaption">
                  La gestión comienza con una necesidad identificada y localizada.
                </p>
              </div>
            </div>

            <div class="connected-route-progress gov-investment-progress">
              <i></i><i></i><i></i><i></i>
            </div>

            <div class="gov-investment-kpis">
              <article><small>Entrada</small><strong>Necesidad</strong></article>
              <article><small>Proceso</small><strong>Gestión</strong></article>
              <article><small>Salida</small><strong>Evidencia</strong></article>
            </div>
          </aside>

          <div class="connected-route-steps gov-investment-steps">
            <article
              class="connected-route-step gov-investment-step active"
              data-route-index="0"
              data-route-title="Prioridad territorial"
              data-route-caption="La gestión comienza con una necesidad identificada, descrita y localizada."
              style="--gov-route-index:0"
            >
              <header><span>01</span><small>DIAGNÓSTICO</small></header>
              <h3>Identificar y priorizar</h3>
              <p>
                Se reconoce la necesidad, su ubicación, población relacionada,
                urgencia y aporte esperado al desarrollo municipal.
              </p>
              <div class="gov-investment-output">
                <small>DECISIÓN PÚBLICA</small>
                <strong>Problema definido y territorio priorizado</strong>
              </div>
            </article>

            <article
              class="connected-route-step gov-investment-step"
              data-route-index="1"
              data-route-title="Planeación y presupuesto"
              data-route-caption="La prioridad se convierte en alcance, responsables, recursos y metas verificables."
              style="--gov-route-index:1"
            >
              <header><span>02</span><small>PLANEACIÓN</small></header>
              <h3>Definir la intervención</h3>
              <p>
                La administración establece alcance, recursos, responsables,
                cronograma, población beneficiada e indicadores de cumplimiento.
              </p>
              <div class="gov-investment-output">
                <small>INSTRUMENTO DE GESTIÓN</small>
                <strong>Proyecto estructurado y metas públicas</strong>
              </div>
            </article>

            <article
              class="connected-route-step gov-investment-step"
              data-route-index="2"
              data-route-title="Ejecución y seguimiento"
              data-route-caption="El avance se publica mediante estados, hitos, responsables y evidencias parciales."
              style="--gov-route-index:2"
            >
              <header><span>03</span><small>EJECUCIÓN</small></header>
              <h3>Hacer visible el avance</h3>
              <p>
                La actuación deja una secuencia consultable de actividades,
                hitos, novedades, compromisos y seguimiento institucional.
              </p>
              <div class="gov-investment-output">
                <small>CONTROL CIUDADANO</small>
                <strong>Avance, estado y responsables visibles</strong>
              </div>
            </article>

            <article
              class="connected-route-step gov-investment-step"
              data-route-index="3"
              data-route-title="Resultado y evidencia"
              data-route-caption="El ciclo concluye con resultados medibles, documentos y evidencia territorial."
              style="--gov-route-index:3"
            >
              <header><span>04</span><small>RESULTADO</small></header>
              <h3>Rendir cuentas con claridad</h3>
              <p>
                La ciudadanía puede revisar qué cambió, cuánto se ejecutó,
                quiénes fueron beneficiados y cuáles documentos lo respaldan.
              </p>
              <div class="gov-investment-output">
                <small>RENDICIÓN DE CUENTAS</small>
                <strong>Resultado medible y evidencia consultable</strong>
              </div>
            </article>
          </div>
        </div>
      </div>
    `;

    const compare = document.createElement("section");
    compare.id = "connectedCompare";
    compare.className = "connected-compare-section";
    compare.innerHTML = `
      <div class="connected-shell">
        <header class="connected-heading connected-heading--light">
          <div>
            <span>EVIDENCIA VISUAL</span>
            <h2>${escapeHtml(config.compareTitle)}</h2>
          </div>
          <p>
            Compare el punto de partida y el resultado sin abandonar el
            contexto territorial.
          </p>
        </header>

        <div class="connected-compare-layout">
          <div
            class="connected-compare"
            id="connectedCompareStage"
            style="--compare-position:50%"
          >
            <div class="connected-compare-layer is-before">
              <div class="connected-compare-placeholder">
                <span>ANTES</span>
                <strong>Estado inicial</strong>
                <small>Agregue una fotografía institucional.</small>
              </div>
            </div>

            <div class="connected-compare-layer is-after">
              <div class="connected-compare-placeholder">
                <span>DESPUÉS</span>
                <strong>Resultado visible</strong>
                <small>Agregue la evidencia final.</small>
              </div>
            </div>

            <div class="connected-compare-divider">
              <i>↔</i>
            </div>

            <input
              id="connectedCompareRange"
              type="range"
              min="0"
              max="100"
              value="50"
              aria-label="Comparar antes y después"
            >

            <span class="connected-compare-label is-before">
              ${escapeHtml(config.compareBeforeLabel)}
            </span>
            <span class="connected-compare-label is-after">
              ${escapeHtml(config.compareAfterLabel)}
            </span>
          </div>

          <aside class="connected-compare-copy">
            <span>ANTES Y DESPUÉS</span>
            <h3 id="connectedCompareTitle">
              ${escapeHtml(config.compareTitle)}
            </h3>
            <strong id="connectedCompareLocation">
              ${escapeHtml(config.compareLocation)}
            </strong>
            <p id="connectedCompareCaption">
              ${escapeHtml(config.compareCaption)}
            </p>
            <a
              class="connected-evidence-link"
              id="connectedEvidenceLink"
              href="${escapeHtml(config.evidenceUrl || "#")}"
              ${config.evidenceUrl ? "" : "aria-disabled='true'"}
              target="_blank"
              rel="noopener"
            >
              Abrir evidencia
              <b>↗</b>
            </a>
          </aside>
        </div>
      </div>
    `;

    const closing = document.createElement("section");
    closing.id = "connectedClosing";
    closing.className = "connected-closing";
    closing.innerHTML = `
      <canvas id="connectedClosingCanvas" aria-hidden="true"></canvas>
      <div class="connected-closing-content">
        <span>RENDICIÓN DE CUENTAS</span>
        <h2>San Pedro se entiende cuando todo se conecta</h2>
        <p>
          Territorio, inversión, participación, resultados y evidencia
          en un mismo recorrido público.
        </p>
        <div>
          <button type="button" id="connectedBackToMap">
            Volver al mapa
          </button>
          <a href="vigencias.html">Consultar vigencias</a>
          <a href="ideas.html">Participar</a>
        </div>
      </div>
    `;

    const anchor =
      document.querySelector("#territoryStory") ||
      document.querySelector("#territorioVivo") ||
      document.querySelector(".explorer-bar");

    if (anchor) {
      anchor.insertAdjacentElement("afterend",network);
      network.insertAdjacentElement("afterend",route);
      route.insertAdjacentElement("afterend",compare);
      compare.insertAdjacentElement("afterend",closing);
    } else {
      document.querySelector("main")?.append(
        network,route,compare,closing
      );
    }

    state.root = network;
    state.route = route;
    state.closing = closing;
    state.canvas = network.querySelector("#connectedNetworkCanvas");
    state.context = state.canvas?.getContext("2d");
    state.networkStage =
      network.querySelector("#connectedNetworkStage");

    applyCompareConfig();
  }

  function selectedData(id) {
    return state.nodes.find(node => node.id === id);
  }

  function updateDetail(node) {
    state.activeNode = node || null;

    state.root?.querySelectorAll(".connected-node").forEach(button => {
      const active = node && button.dataset.connectedNode === node.id;
      button.classList.toggle("active",Boolean(active));
    });
    state.root?.querySelectorAll(".connected-location-item").forEach(button => {
      const active = node && button.dataset.connectedPick === node.id;
      button.classList.toggle("active",Boolean(active));
    });
    if (node) rotateToNode(node);

    const eyebrow = state.root?.querySelector("#connectedDetailEyebrow");
    const title = state.root?.querySelector("#connectedDetailTitle");
    const text = state.root?.querySelector("#connectedDetailText");
    const meta = state.root?.querySelector("#connectedDetailMeta");
    const mapLink = state.root?.querySelector("#connectedMapLink");

    const facts = state.root?.querySelector("#connectedDetailFacts");
    const support = state.root?.querySelector("#connectedDetailSupport");

    if (!node) {
      eyebrow.textContent = "SAN PEDRO";
      title.textContent = "Seleccione un territorio";
      text.textContent =
        "La red permite recorrer la cabecera, los barrios y los corregimientos sin sustituir el mapa real.";
      meta.innerHTML = "";
      if (facts) {
        facts.innerHTML = `
          <article><small>Nivel</small><strong>Red territorial</strong></article>
          <article><small>Relación</small><strong>Centro, urbano y rural</strong></article>
          <article><small>Acción</small><strong>Seleccione un nodo</strong></article>`;
      }
      if (support) {
        support.textContent =
          "Use los filtros, seleccione un punto y luego abra su ubicación en el mapa para continuar la navegación.";
      }
      mapLink.disabled = true;
      mapLink.removeAttribute("data-location-id");
      return;
    }

    const label = node.group === "center"
      ? "CABECERA MUNICIPAL"
      : node.group === "neighborhood"
        ? "BARRIO URBANO"
        : "CORREGIMIENTO";

    eyebrow.textContent = label;
    title.textContent = node.name;
    text.textContent =
      node.note ||
      node.description ||
      "Punto territorial conectado con la gestión municipal.";

    const chips = [
      node.kind,
      node.sector,
      node.altitude ? `${node.altitude} m s. n. m.` : "",
      node.veredas?.length
        ? `${node.veredas.length} veredas`
        : ""
    ].filter(Boolean);

    meta.innerHTML = chips.map(chip =>
      `<span>${escapeHtml(chip)}</span>`
    ).join("");

    if (facts) {
      const coverage = node.group === "rural"
        ? (node.veredas?.length
            ? `${node.veredas.length} veredas`
            : "Cobertura rural")
        : node.group === "neighborhood"
          ? (node.sector || "Sector urbano")
          : "Núcleo municipal";
      const altitude = node.altitude
        ? `${node.altitude} m s. n. m.`
        : "Sin altitud registrada";
      const relation = node.group === "center"
        ? "Cabecera"
        : node.group === "neighborhood"
          ? "Barrio"
          : "Corregimiento";
      facts.innerHTML = `
        <article><small>Tipo</small><strong>${escapeHtml(relation)}</strong></article>
        <article><small>Cobertura</small><strong>${escapeHtml(coverage)}</strong></article>
        <article><small>Altitud</small><strong>${escapeHtml(altitude)}</strong></article>`;
    }

    if (support) {
      support.textContent =
        node.group === "center"
          ? "La cabecera municipal actúa como punto de referencia para los barrios urbanos y las conexiones generales del municipio."
          : node.group === "neighborhood"
            ? "Este barrio pertenece al anillo urbano y puede abrirse en el mapa real para revisar su localización con mayor detalle."
            : "Este corregimiento aparece en el anillo exterior para facilitar la lectura del territorio rural y su conexión con la cartografía principal.";
    }

    mapLink.disabled = false;
    mapLink.dataset.locationId = node.id;
  }

  function setFilter(filter) {
    const allowed = new Set(['all','neighborhood','rural']);
    const nextFilter = allowed.has(filter) ? filter : 'all';
    state.filter = nextFilter;

    state.root?.querySelectorAll('[data-connected-filter]')
      .forEach(button => {
        const active = button.dataset.connectedFilter === nextFilter;
        button.classList.toggle('active',active);
        button.setAttribute('aria-pressed',String(active));
      });

    state.root?.querySelectorAll('.connected-node').forEach(button => {
      const group = button.dataset.connectedGroup;
      const visible = nextFilter === 'all' || group === nextFilter;
      button.classList.toggle('filtered-out',!visible);
      button.setAttribute('aria-hidden',String(!visible));
    });

    state.root?.querySelectorAll('.connected-location-item').forEach(button => {
      const group = button.dataset.connectedGroup;
      button.hidden = !(nextFilter === 'all' || group === nextFilter);
    });

    state.root?.querySelectorAll('[data-picker-section]').forEach(section => {
      const group = section.dataset.pickerSection;
      section.hidden = !(nextFilter === 'all' || group === nextFilter);
    });

    const status = state.root?.querySelector('#connectedFilterStatus');
    if (status) {
      status.textContent = nextFilter === 'neighborhood'
        ? 'BARRIOS URBANOS'
        : nextFilter === 'rural'
          ? 'CORREGIMIENTOS'
          : 'ATLAS COMPLETO';
    }

    const candidates = state.nodes.filter(node =>
      nextFilter === 'all'
        ? node.group === 'center'
        : node.group === nextFilter
    );
    const selectedStillVisible = state.activeNode && (
      nextFilter === 'all' || state.activeNode.group === nextFilter
    );
    const target = selectedStillVisible
      ? state.activeNode
      : candidates[0] || state.nodes[0] || null;

    if (target) updateDetail(target);
    drawNetwork();
    startNetwork();
  }

  function resizeCanvas() {
    if (!state.canvas || !state.networkStage) return;

    const rect = state.networkStage.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1,1.55);
    state.canvas.width = Math.max(1,Math.round(rect.width * ratio));
    state.canvas.height = Math.max(1,Math.round(rect.height * ratio));
    state.canvas.style.width = `${rect.width}px`;
    state.canvas.style.height = `${rect.height}px`;

    state.context?.setTransform(ratio,0,0,ratio,0,0);
    drawNetwork();
  }

  function nodeIsVisible(node) {
    return (
      state.filter === "all" ||
      node.group === state.filter
    );
  }

  function normalizeAngle(angle) {
    while (angle > Math.PI) angle -= Math.PI * 2;
    while (angle < -Math.PI) angle += Math.PI * 2;
    return angle;
  }

  function rotateToNode(node) {
    if (!node) return;
    state.sphere.velocityX = 0;
    state.sphere.velocityY = 0;
    state.sphere.lastInteraction = performance.now();
    state.sphere.targetY = normalizeAngle(-node.sphereLon);
    state.sphere.targetX = Math.max(-.82,Math.min(.82,node.sphereLat));
    if (reducedMotion.matches) {
      state.sphere.rotY = state.sphere.targetY;
      state.sphere.rotX = state.sphere.targetX;
    }
  }

  function rotatedPoint(node) {
    return rotatedPointAt(node);
  }

  function projectNode(node,rect) {
    const geometry = sphereGeometry(rect);
    const rotated = rotatedPoint(node);
    const perspective = .68 + (rotated.z + 1) * .27;
    return {
      ...rotated,
      node,
      radius:geometry.radius,
      cx:geometry.centerX,
      cy:geometry.centerY,
      x:geometry.centerX + rotated.x * geometry.radius * perspective,
      y:geometry.centerY + rotated.y * geometry.radius * .93 * perspective,
      scale:node.group === 'center'
        ? .92 + perspective * .28
        : .72 + perspective * .30,
      opacity:Math.max(.16,.32 + (rotated.z + 1) * .46),
      visible:rotated.z > .018
    };
  }

  function updateNodeButtons(projected) {
    state.root?.querySelectorAll('.connected-node').forEach(button => {
      const item = projected.find(entry => entry.node.id === button.dataset.connectedNode);
      if (!item) return;
      const filtered = !nodeIsVisible(item.node);
      button.style.left = `${item.x}px`;
      button.style.top = `${item.y}px`;
      button.style.transform = `translate(-50%,-50%) scale(${item.scale})`;
      button.style.opacity = filtered ? '.04' : String(item.visible ? item.opacity : 0);
      button.style.visibility = item.visible ? 'visible' : 'hidden';
      button.style.pointerEvents = filtered || !item.visible ? 'none' : 'auto';
      button.style.zIndex = String(8 + Math.round((item.z + 1) * 14));
      button.classList.toggle('is-back',item.z <= .035);
      button.classList.toggle('is-front',item.z > .25);
      button.classList.toggle('filtered-out',filtered);
    });
  }

  function drawCurve(ctx,points,strokeStyle,lineWidth) {
    let started = false;
    ctx.beginPath();
    points.forEach(point => {
      if (point.visible) {
        if (!started) {
          ctx.moveTo(point.x,point.y);
          started = true;
        } else {
          ctx.lineTo(point.x,point.y);
        }
      } else {
        started = false;
      }
    });
    if (lineWidth) ctx.lineWidth = lineWidth;
    if (strokeStyle) ctx.strokeStyle = strokeStyle;
    ctx.stroke();
  }

  function sampleSphereLine(type,fixed,rect) {
    const points = [];
    for (let step = 0; step <= 72; step += 1) {
      const t = -Math.PI + (Math.PI * 2 * step / 72);
      const lat = type === 'lon' ? t / 2 : fixed;
      const lon = type === 'lon' ? fixed : t;
      const cosLat = Math.cos(lat);
      const pseudo = {
        sphereX:Math.sin(lon) * cosLat,
        sphereY:Math.sin(lat),
        sphereZ:Math.cos(lon) * cosLat
      };
      const rotated = rotatedPoint(pseudo);
      const geometry = sphereGeometry(rect);
      const perspective = .68 + (rotated.z + 1) * .27;
      points.push({
        x:geometry.centerX + rotated.x * geometry.radius * perspective,
        y:geometry.centerY + rotated.y * geometry.radius * .93 * perspective,
        visible:rotated.z > .018
      });
    }
    return points;
  }

  function drawNetwork() {
    const ctx = state.context;
    const stage = state.networkStage;
    if (!ctx || !stage) return;

    const rect = stage.getBoundingClientRect();
    ctx.clearRect(0,0,rect.width,rect.height);

    const now = performance.now();
    const rotDeltaY = normalizeAngle(state.sphere.targetY - state.sphere.rotY);
    const rotDeltaX = state.sphere.targetX - state.sphere.rotX;
    const zoomDelta = state.sphere.targetZoom - state.sphere.zoom;

    if (!state.sphere.dragging) {
      if (
        Math.abs(state.sphere.velocityX) > .00008 ||
        Math.abs(state.sphere.velocityY) > .00008
      ) {
        state.sphere.rotY = normalizeAngle(
          state.sphere.rotY + state.sphere.velocityY
        );
        state.sphere.rotX = Math.max(-.92,Math.min(.92,
          state.sphere.rotX + state.sphere.velocityX
        ));
        state.sphere.targetY = state.sphere.rotY;
        state.sphere.targetX = state.sphere.rotX;
        state.sphere.velocityX *= .925;
        state.sphere.velocityY *= .925;
      } else {
        state.sphere.rotY = normalizeAngle(
          state.sphere.rotY + rotDeltaY * .072
        );
        state.sphere.rotX += rotDeltaX * .082;
      }

      if (
        state.sphere.autoRotate &&
        now - state.sphere.lastInteraction > 7200 &&
        Math.abs(rotDeltaY) < .006 &&
        Math.abs(rotDeltaX) < .006
      ) {
        state.sphere.targetY = normalizeAngle(
          state.sphere.targetY + state.sphere.spin
        );
      }
    }

    state.sphere.zoom += zoomDelta * .10;

    const geometry = sphereGeometry(rect);
    const centerX = geometry.centerX;
    const centerY = geometry.centerY;
    const sphereRadius = geometry.radius;

    ctx.save();
    drawPlanetBackdrop(ctx,rect);

    const atmosphere = ctx.createRadialGradient(
      centerX,
      centerY,
      sphereRadius * .78,
      centerX,
      centerY,
      sphereRadius * 1.22
    );
    atmosphere.addColorStop(0,'rgba(40,157,235,0)');
    atmosphere.addColorStop(.72,'rgba(62,179,241,.07)');
    atmosphere.addColorStop(.91,'rgba(92,210,255,.23)');
    atmosphere.addColorStop(1,'rgba(109,220,255,0)');
    ctx.fillStyle = atmosphere;
    ctx.beginPath();
    ctx.arc(centerX,centerY,sphereRadius * 1.22,0,Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,.66)';
    ctx.shadowBlur = 58;
    ctx.shadowOffsetY = 24;
    const ocean = ctx.createRadialGradient(
      centerX - sphereRadius * .30,
      centerY - sphereRadius * .34,
      sphereRadius * .06,
      centerX,
      centerY,
      sphereRadius * 1.18
    );
    ocean.addColorStop(0,'#45baf2');
    ocean.addColorStop(.24,'#1686cb');
    ocean.addColorStop(.56,'#075ba9');
    ocean.addColorStop(.82,'#043b78');
    ocean.addColorStop(1,'#021b42');
    ctx.beginPath();
    ctx.arc(centerX,centerY,sphereRadius,0,Math.PI * 2);
    ctx.fillStyle = ocean;
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX,centerY,sphereRadius,0,Math.PI * 2);
    ctx.clip();

    drawPlanetSurface(ctx,rect);

    [-1.10,-.55,0,.55,1.10].forEach(lon => {
      drawCurve(
        ctx,
        sampleSphereLine('lon',lon,rect),
        'rgba(188,229,247,.105)',
        .7
      );
    });
    [-.85,-.42,0,.42,.85].forEach(lat => {
      drawCurve(
        ctx,
        sampleSphereLine('lat',lat,rect),
        'rgba(188,229,247,.085)',
        .65
      );
    });

    drawCloudLayer(ctx,rect);

    const daylight = ctx.createLinearGradient(
      centerX - sphereRadius,
      centerY - sphereRadius * .5,
      centerX + sphereRadius,
      centerY + sphereRadius * .45
    );
    daylight.addColorStop(0,'rgba(255,255,255,.19)');
    daylight.addColorStop(.28,'rgba(255,255,255,.035)');
    daylight.addColorStop(.58,'rgba(1,20,48,.08)');
    daylight.addColorStop(.82,'rgba(0,8,29,.34)');
    daylight.addColorStop(1,'rgba(0,5,22,.60)');
    ctx.fillStyle = daylight;
    ctx.fillRect(
      centerX - sphereRadius,
      centerY - sphereRadius,
      sphereRadius * 2,
      sphereRadius * 2
    );

    const specular = ctx.createRadialGradient(
      centerX - sphereRadius * .38,
      centerY - sphereRadius * .42,
      0,
      centerX - sphereRadius * .28,
      centerY - sphereRadius * .32,
      sphereRadius * .72
    );
    specular.addColorStop(0,'rgba(255,255,255,.31)');
    specular.addColorStop(.24,'rgba(255,255,255,.10)');
    specular.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle = specular;
    ctx.fillRect(
      centerX - sphereRadius,
      centerY - sphereRadius,
      sphereRadius * 2,
      sphereRadius * 2
    );

    const projected = state.nodes.map(node => projectNode(node,rect));
    const selected = projected.find(item =>
      item.node.id === state.activeNode?.id
    );

    projected
      .filter(item => nodeIsVisible(item.node) && item.visible)
      .sort((a,b) => a.z - b.z)
      .forEach(item => {
        if (item.node.group === 'center') return;
        const halo = ctx.createRadialGradient(
          item.x,
          item.y,
          1,
          item.x,
          item.y,
          20 * item.scale
        );
        halo.addColorStop(
          0,
          item.node.group === 'neighborhood'
            ? 'rgba(151,125,239,.38)'
            : 'rgba(73,202,244,.34)'
        );
        halo.addColorStop(1,'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.fillStyle = halo;
        ctx.arc(item.x,item.y,20 * item.scale,0,Math.PI * 2);
        ctx.fill();
      });

    if (selected && selected.visible) {
      ctx.beginPath();
      ctx.moveTo(centerX,centerY);
      ctx.quadraticCurveTo(
        (centerX + selected.x) / 2,
        centerY - sphereRadius * .28,
        selected.x,
        selected.y
      );
      ctx.strokeStyle = 'rgba(115,239,190,.88)';
      ctx.lineWidth = 2.1;
      ctx.shadowColor = 'rgba(101,226,176,.65)';
      ctx.shadowBlur = 13;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    ctx.restore();

    ctx.beginPath();
    ctx.arc(centerX,centerY,sphereRadius,0,Math.PI * 2);
    ctx.strokeStyle = 'rgba(193,238,255,.34)';
    ctx.lineWidth = 1.35;
    ctx.shadowColor = 'rgba(70,192,247,.54)';
    ctx.shadowBlur = 14;
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.arc(centerX,centerY,sphereRadius * 1.035,0,Math.PI * 2);
    ctx.strokeStyle = 'rgba(93,210,255,.12)';
    ctx.lineWidth = 5;
    ctx.stroke();

    if (selected && selected.visible && !reducedMotion.matches) {
      const pulse = 12 + Math.sin(state.time * .0048) * 3.5;
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(111,240,192,.52)';
      ctx.lineWidth = 1.2;
      ctx.arc(selected.x,selected.y,pulse,0,Math.PI * 2);
      ctx.stroke();
    }

    updateNodeButtons(projected);
    ctx.restore();
  }

  function animateNetwork(time) {
    state.frame = 0;
    state.time = time;
    drawNetwork();

    if (
      state.visible &&
      !document.hidden &&
      !reducedMotion.matches
    ) {
      state.frame = requestAnimationFrame(animateNetwork);
    }
  }

  function startNetwork() {
    if (state.frame || reducedMotion.matches) {
      drawNetwork();
      return;
    }
    state.frame = requestAnimationFrame(animateNetwork);
  }

  function stopNetwork() {
    if (state.frame) cancelAnimationFrame(state.frame);
    state.frame = 0;
  }

  function setupNetworkObserver() {
    if (!state.root) return;

    if (!("IntersectionObserver" in window)) {
      state.visible = true;
      startNetwork();
      return;
    }

    state.networkObserver = new IntersectionObserver(entries => {
      const visible = entries.some(entry => entry.isIntersecting);
      state.visible = visible;
      if (visible) startNetwork();
      else stopNetwork();
    },{
      threshold:.03,
      rootMargin:"180px 0px"
    });

    state.networkObserver.observe(state.root);
  }

  function setRouteStep(step) {
    if (!step || !state.route) return;

    const index = Number(step.dataset.routeIndex || 0);
    state.route.style.setProperty("--connected-step",String(index));

    state.route.querySelectorAll(".connected-route-step")
      .forEach(item => item.classList.toggle("active",item === step));

    const number = state.route.querySelector("#connectedRouteNumber");
    const title = state.route.querySelector("#connectedRouteTitle");
    const caption = state.route.querySelector("#connectedRouteCaption");

    if (number) number.textContent = String(index + 1).padStart(2,"0");
    if (title) title.textContent = step.dataset.routeTitle || "";
    if (caption) caption.textContent = step.dataset.routeCaption || "";

    state.route.querySelectorAll(".connected-route-progress i")
      .forEach((item,itemIndex) => {
        item.classList.toggle("active",itemIndex <= index);
      });
    state.route.querySelectorAll("[data-route-map-node]")
      .forEach(node => {
        node.classList.toggle(
          "active",
          Number(node.dataset.routeMapNode) === index
        );
      });
    state.route.dataset.activeStep = String(index);
  }

  function setupRouteObserver() {
    if (!state.route) return;
    const steps = [
      ...state.route.querySelectorAll(".connected-route-step")
    ];

    steps.forEach(step => {
      step.addEventListener("click",() => setRouteStep(step));
    });

    if (!("IntersectionObserver" in window)) return;

    state.routeObserver = new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible) setRouteStep(visible.target);
    },{
      threshold:[.28,.52,.76],
      rootMargin:"-24% 0px -48% 0px"
    });

    steps.forEach(step => state.routeObserver.observe(step));

    let progressFrame = 0;
    const updateProgress = () => {
      progressFrame = 0;
      if (!state.route) return;
      const rect = state.route.getBoundingClientRect();
      const travel = Math.max(1,rect.height - innerHeight);
      const progress = Math.max(0,Math.min(1,(-rect.top + innerHeight * .18) / travel));
      state.route.style.setProperty(
        "--route-progress",
        progress.toFixed(4)
      );
    };
    const requestProgress = () => {
      if (progressFrame) return;
      progressFrame = requestAnimationFrame(updateProgress);
    };
    addEventListener("scroll",requestProgress,{passive:true});
    addEventListener("resize",requestProgress,{passive:true});
    requestProgress();
  }

  function compareVisualMarkup(url,type) {
    if (url) {
      return `
        <img
          src="${escapeHtml(url)}"
          alt=""
          loading="lazy"
          decoding="async"
        >`;
    }

    return `
      <div class="connected-compare-placeholder is-${type}">
        <span>${type === "before" ? "ANTES" : "DESPUÉS"}</span>
        <strong>
          ${type === "before"
            ? "Estado inicial"
            : "Resultado visible"}
        </strong>
        <small>
          ${type === "before"
            ? "Agregue una fotografía institucional."
            : "Agregue la evidencia final."}
        </small>
      </div>`;
  }

  function applyCompareConfig() {
    const compare = document.querySelector("#connectedCompareStage");
    if (!compare) return;

    const before = compare.querySelector(
      ".connected-compare-layer.is-before"
    );
    const after = compare.querySelector(
      ".connected-compare-layer.is-after"
    );

    before.innerHTML = compareVisualMarkup(
      state.config.compareBefore,
      "before"
    );
    after.innerHTML = compareVisualMarkup(
      state.config.compareAfter,
      "after"
    );

    document.querySelector(
      ".connected-compare-label.is-before"
    ).textContent = state.config.compareBeforeLabel;

    document.querySelector(
      ".connected-compare-label.is-after"
    ).textContent = state.config.compareAfterLabel;

    document.querySelector("#connectedCompareTitle").textContent =
      state.config.compareTitle;
    document.querySelector("#connectedCompareLocation").textContent =
      state.config.compareLocation;
    document.querySelector("#connectedCompareCaption").textContent =
      state.config.compareCaption;

    const link = document.querySelector("#connectedEvidenceLink");
    if (state.config.evidenceUrl) {
      link.href = state.config.evidenceUrl;
      link.removeAttribute("aria-disabled");
    } else {
      link.href = "#";
      link.setAttribute("aria-disabled","true");
    }
  }

  function resizeClosingCanvas() {
    const canvas = document.querySelector("#connectedClosingCanvas");
    if (!canvas || !state.closing) return;

    const rect = state.closing.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1,2);
    canvas.width = Math.round(rect.width * ratio);
    canvas.height = Math.round(rect.height * ratio);

    const ctx = canvas.getContext("2d");
    ctx.setTransform(ratio,0,0,ratio,0,0);
    ctx.clearRect(0,0,rect.width,rect.height);

    const points = state.nodes.map((node,index) => {
      const columns = 8;
      const row = Math.floor(index / columns);
      const column = index % columns;
      const targetX =
        rect.width * .5 +
        (column - (columns - 1) / 2) * 28;
      const targetY =
        rect.height * .52 +
        (row - 1) * 28;
      return {
        startX:node.x * rect.width,
        startY:node.y * rect.height,
        targetX,
        targetY,
        group:node.group
      };
    });

    points.forEach((point,index) => {
      const progress = reducedMotion.matches
        ? 1
        : .72 + Math.sin(index * .9) * .06;
      const x =
        point.startX + (point.targetX - point.startX) * progress;
      const y =
        point.startY + (point.targetY - point.startY) * progress;

      ctx.beginPath();
      ctx.fillStyle = point.group === "neighborhood"
        ? "rgba(143,122,227,.78)"
        : point.group === "center"
          ? "rgba(101,226,176,.96)"
          : "rgba(67,195,232,.76)";
      ctx.arc(x,y,point.group === "center" ? 5 : 3,0,Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.strokeStyle = "rgba(116,199,243,.10)";
      ctx.moveTo(rect.width / 2,rect.height / 2);
      ctx.lineTo(x,y);
      ctx.stroke();
    });
  }

  function ensureAdminDialog() {
    if (state.adminDialog) return state.adminDialog;

    const dialog = document.createElement("dialog");
    dialog.id = "connectedAdminDialog";
    dialog.className = "connected-admin-dialog";
    dialog.innerHTML = `
      <div class="connected-admin-shell">
        <header>
          <div>
            <span>SAN PEDRO CONECTADO</span>
            <h2>Gestionar experiencia visual</h2>
            <p>
              Configure textos y fotografías institucionales sin modificar
              el mapa real ni las demás secciones.
            </p>
          </div>
          <button
            type="button"
            data-connected-admin-close
            aria-label="Cerrar"
          >×</button>
        </header>

        <form id="connectedAdminForm">
          <section>
            <h3>Red territorial</h3>
            <label>
              Título
              <input
                name="networkTitle"
                maxlength="90"
                value="${escapeHtml(state.config.networkTitle)}"
              >
            </label>
            <label>
              Descripción
              <textarea
                name="networkLead"
                rows="3"
                maxlength="320"
              >${escapeHtml(state.config.networkLead)}</textarea>
            </label>
          </section>

          <section>
            <h3>Comparador antes y después</h3>
            <div class="connected-admin-grid">
              <label>
                Título
                <input
                  name="compareTitle"
                  maxlength="100"
                  value="${escapeHtml(state.config.compareTitle)}"
                >
              </label>
              <label>
                Ubicación
                <input
                  name="compareLocation"
                  maxlength="120"
                  value="${escapeHtml(state.config.compareLocation)}"
                >
              </label>
            </div>

            <label>
              Descripción
              <textarea
                name="compareCaption"
                rows="3"
                maxlength="500"
              >${escapeHtml(state.config.compareCaption)}</textarea>
            </label>

            <div class="connected-admin-grid">
              <label>
                URL de imagen anterior
                <input
                  name="compareBefore"
                  type="url"
                  value="${escapeHtml(state.config.compareBefore)}"
                  placeholder="https://..."
                >
              </label>
              <label>
                URL de imagen posterior
                <input
                  name="compareAfter"
                  type="url"
                  value="${escapeHtml(state.config.compareAfter)}"
                  placeholder="https://..."
                >
              </label>
              <label>
                Etiqueta anterior
                <input
                  name="compareBeforeLabel"
                  maxlength="30"
                  value="${escapeHtml(state.config.compareBeforeLabel)}"
                >
              </label>
              <label>
                Etiqueta posterior
                <input
                  name="compareAfterLabel"
                  maxlength="30"
                  value="${escapeHtml(state.config.compareAfterLabel)}"
                >
              </label>
            </div>

            <label>
              Enlace de evidencia
              <input
                name="evidenceUrl"
                type="url"
                value="${escapeHtml(state.config.evidenceUrl)}"
                placeholder="https://..."
              >
            </label>
          </section>

          <footer>
            <button
              type="button"
              class="button button-secondary"
              data-connected-admin-close
            >
              Cancelar
            </button>
            <button type="submit" class="button button-primary">
              Guardar experiencia
            </button>
          </footer>
        </form>
      </div>`;

    document.body.appendChild(dialog);
    state.adminDialog = dialog;

    dialog.addEventListener("click",event => {
      if (
        event.target === dialog ||
        event.target.closest("[data-connected-admin-close]")
      ) {
        dialog.close();
      }
    });

    dialog.querySelector("#connectedAdminForm")
      .addEventListener("submit",async event => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);

        const save = async () => {
          [
            "networkTitle",
            "networkLead",
            "compareTitle",
            "compareLocation",
            "compareBefore",
            "compareAfter",
            "compareBeforeLabel",
            "compareAfterLabel",
            "compareCaption",
            "evidenceUrl"
          ].forEach(key => {
            state.config[key] = String(data.get(key) || "").trim();
          });

          persistConfig();
          refreshContent();
          await new Promise(resolve => window.setTimeout(resolve,260));
        };

        try {
          if (portal()?.helpers?.withLoading) {
            await portal().helpers.withLoading(save,{
              loadingMessage:"Guardando la experiencia territorial…",
              successMessage:"Experiencia territorial actualizada."
            });
          } else {
            await save();
          }
          dialog.close();
        } catch (error) {
          console.error("SanPedroConnected:",error);
        }
      });

    return dialog;
  }

  function openAdmin() {
    if (!isAdmin()) {
      portal()?.helpers?.toast?.(
        "Debe iniciar sesión con permisos administrativos."
      );
      return;
    }

    state.adminDialog?.remove();
    state.adminDialog = null;
    ensureAdminDialog().showModal();
  }

  function refreshContent() {
    const title = state.root?.querySelector(".connected-heading h2");
    const lead = state.root?.querySelector(".connected-heading > p");
    if (title) title.textContent = state.config.networkTitle;
    if (lead) lead.textContent = state.config.networkLead;
    applyCompareConfig();
  }

  function syncAdmin() {
    const button = state.root?.querySelector("#connectedAdminButton");
    if (button) button.hidden = !isAdmin();
  }

  function bindEvents() {
    state.root?.addEventListener("click",event => {
      const nodeButton = event.target.closest("[data-connected-node]");
      if (nodeButton) {
        updateDetail(
          selectedData(nodeButton.dataset.connectedNode)
        );
        startNetwork();
        return;
      }

      const pickButton = event.target.closest('[data-connected-pick]');
      if (pickButton) {
        updateDetail(selectedData(pickButton.dataset.connectedPick));
        startNetwork();
        return;
      }

      if (event.target.closest("#connectedMapLink")) {
        const id = event.target.closest("#connectedMapLink")
          ?.dataset.locationId;
        if (id) window.TerritoryExperience?.focusLocation?.(id);
        return;
      }

      const feature = event.target.closest(
        "[data-connected-feature]"
      );
      if (feature) {
        const key = feature.dataset.connectedFeature;
        if (key === "territory") {
          state.root.querySelector(".connected-network-stage")
            ?.scrollIntoView({behavior:"smooth",block:"center"});
        } else if (key === "investment") {
          state.route?.scrollIntoView({
            behavior:"smooth",
            block:"start"
          });
        } else if (key === "participation") {
          location.href = "ideas.html";
        } else if (key === "evidence") {
          document.querySelector("#connectedCompare")
            ?.scrollIntoView({behavior:"smooth",block:"start"});
        }
        return;
      }

      if (event.target.closest("#connectedAdminButton")) {
        openAdmin();
      }
    });

    state.root?.querySelectorAll('[data-connected-filter]')
      .forEach(button => {
        button.addEventListener('pointerdown',event => {
          event.stopPropagation();
        });
        button.addEventListener('click',event => {
          event.preventDefault();
          event.stopPropagation();
          setFilter(button.dataset.connectedFilter || 'all');
        });
      });

    state.networkStage?.addEventListener("pointerdown",event => {
      if (event.target.closest(
        'button,a,input,select,textarea,[role="button"],.connected-location-picker'
      )) return;
      event.preventDefault();
      window.getSelection?.()?.removeAllRanges?.();
      state.sphere.dragging = true;
      state.sphere.pointerId = event.pointerId;
      state.sphere.lastX = event.clientX;
      state.sphere.lastY = event.clientY;
      state.sphere.velocityX = 0;
      state.sphere.velocityY = 0;
      state.sphere.lastInteraction = performance.now();
      state.networkStage.setPointerCapture?.(event.pointerId);
      state.networkStage.classList.add('is-dragging');
      document.documentElement.classList.add('is-connected-sphere-dragging');
    });

    state.networkStage?.addEventListener("pointermove",event => {
      const rect = state.networkStage.getBoundingClientRect();
      state.pointer.x =
        Math.max(0,Math.min(1,(event.clientX - rect.left) / rect.width));
      state.pointer.y =
        Math.max(0,Math.min(1,(event.clientY - rect.top) / rect.height));

      if (!state.sphere.dragging || state.sphere.pointerId !== event.pointerId) return;
      event.preventDefault();
      window.getSelection?.()?.removeAllRanges?.();
      const dx = event.clientX - state.sphere.lastX;
      const dy = event.clientY - state.sphere.lastY;
      state.sphere.lastX = event.clientX;
      state.sphere.lastY = event.clientY;
      const velocityY = dx * .0080;
      const velocityX = dy * .0061;
      state.sphere.rotY = normalizeAngle(
        state.sphere.rotY + velocityY
      );
      state.sphere.rotX = Math.max(-.92,Math.min(.92,
        state.sphere.rotX + velocityX
      ));
      state.sphere.targetY = state.sphere.rotY;
      state.sphere.targetX = state.sphere.rotX;
      state.sphere.velocityY = velocityY;
      state.sphere.velocityX = velocityX;
      state.sphere.lastInteraction = performance.now();
      drawNetwork();
    },{passive:false});

    const releaseSphere = () => {
      state.sphere.dragging = false;
      state.sphere.pointerId = null;
      state.networkStage?.classList.remove('is-dragging');
      document.documentElement.classList.remove('is-connected-sphere-dragging');
      window.getSelection?.()?.removeAllRanges?.();
    };

    state.networkStage?.addEventListener('pointerup',releaseSphere,{passive:true});
    state.networkStage?.addEventListener('pointercancel',releaseSphere,{passive:true});
    state.networkStage?.addEventListener("pointerleave",() => {
      state.pointer.x = .5;
      state.pointer.y = .5;
    },{passive:true});

    state.networkStage?.addEventListener("wheel",event => {
      event.preventDefault();
      state.sphere.lastInteraction = performance.now();
      state.sphere.targetZoom = Math.max(.84,Math.min(1.18,
        state.sphere.targetZoom + (event.deltaY < 0 ? .06 : -.06)
      ));
      startNetwork();
    },{passive:false});

    const changeSphereZoom = amount => {
      state.sphere.lastInteraction = performance.now();
      state.sphere.targetZoom = Math.max(.84,Math.min(1.18,
        state.sphere.targetZoom + amount
      ));
      if (reducedMotion.matches) {
        state.sphere.zoom = state.sphere.targetZoom;
      }
      startNetwork();
    };

    state.root?.querySelector("#connectedSphereZoomIn")
      ?.addEventListener("click",() => changeSphereZoom(.08));
    state.root?.querySelector("#connectedSphereZoomOut")
      ?.addEventListener("click",() => changeSphereZoom(-.08));
    state.root?.querySelector("#connectedSphereReset")
      ?.addEventListener("click",() => {
        state.sphere.velocityX = 0;
        state.sphere.velocityY = 0;
        state.sphere.targetX = -.18;
        state.sphere.targetY = .24;
        state.sphere.targetZoom = 1;
        state.sphere.lastInteraction = performance.now();
        updateDetail(
          state.nodes.find(node => node.group === "center") ||
          state.nodes[0] ||
          null
        );
        startNetwork();
      });
    state.root?.querySelector("#connectedSphereAuto")
      ?.addEventListener("click",event => {
        state.sphere.autoRotate = !state.sphere.autoRotate;
        state.sphere.lastInteraction = performance.now() - 8000;
        event.currentTarget.classList.toggle(
          "active",
          state.sphere.autoRotate
        );
        event.currentTarget.setAttribute(
          "aria-pressed",
          String(state.sphere.autoRotate)
        );
        startNetwork();
      });

    const range = document.querySelector("#connectedCompareRange");
    range?.addEventListener("input",event => {
      state.compareValue = Number(event.target.value);
      const compare = document.querySelector("#connectedCompareStage");
      compare?.style.setProperty(
        "--compare-position",
        `${state.compareValue}%`
      );
    });

    document.querySelector("#connectedEvidenceLink")
      ?.addEventListener("click",event => {
        if (
          event.currentTarget.getAttribute("aria-disabled") === "true"
        ) {
          event.preventDefault();
          portal()?.helpers?.toast?.(
            "Aún no se ha cargado un enlace de evidencia."
          );
        }
      });

    document.querySelector("#connectedBackToMap")
      ?.addEventListener("click",() => {
        document.querySelector("#territorioVivo")
          ?.scrollIntoView({behavior:"smooth",block:"start"});
      });

    [
      "portal:datachange",
      "portal:adminchange",
      "firebase:authchange"
    ].forEach(name => {
      document.addEventListener(name,() => {
        state.config = getConfigStore();
        syncAdmin();
        refreshContent();
      });
    });

    document.addEventListener("visibilitychange",() => {
      if (document.hidden) stopNetwork();
      else if (state.visible) startNetwork();
    });

    window.addEventListener("resize",() => {
      resizeCanvas();
      resizeClosingCanvas();
    },{passive:true});
  }

  function init() {
    if (!isHome()) return;

    if (state.initialized) {
      syncAdmin();
      resizeCanvas();
      return;
    }

    state.initialized = true;
    state.config = getConfigStore();
    state.data = getTerritoryData();

    createSections();
    state.villageTexture = createTerritoryAtlas(state.nodes);
    bindEvents();
    syncAdmin();
    setupNetworkObserver();
    setupRouteObserver();

    state.resizeObserver = "ResizeObserver" in window
      ? new ResizeObserver(() => {
          resizeCanvas();
          resizeClosingCanvas();
        })
      : null;

    if (state.resizeObserver) {
      state.resizeObserver.observe(state.networkStage);
      state.resizeObserver.observe(state.closing);
    }

    resizeCanvas();
    resizeClosingCanvas();
    drawNetwork();
    updateDetail(state.nodes.find(node => node.group === "center") || state.nodes[0] || null);

    window.dispatchEvent(new CustomEvent("portal:rendered",{
      detail:{source:"san-pedro-connected",build:BUILD}
    }));
  }

  window.SanPedroConnected = {
    init,
    openAdmin,
    refresh:() => {
      state.config = getConfigStore();
      state.data = getTerritoryData();
      state.villageTexture = createTerritoryAtlas(state.nodes);
      refreshContent();
      resizeCanvas();
      resizeClosingCanvas();
      updateDetail(state.activeNode || state.nodes.find(node => node.group === "center") || state.nodes[0] || null);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded",init,{once:true});
  } else {
    init();
  }
})();