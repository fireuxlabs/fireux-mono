<template>
  <aside
    aria-labelledby="misebox-landing-practice-title"
    class="border-b border-dashed border-warning/40 bg-warning/5"
  >
    <UContainer class="py-4">
      <div class="space-y-3">
        <div>
          <p
            id="misebox-landing-practice-title"
            class="font-semibold text-warning"
          >
            Landing practice
          </p>
          <p class="text-sm text-muted">
            Temporary working draft for the Misebox landing page.
          </p>
        </div>

        <div>
          <p class="font-semibold text-warning">Working outline</p>
        </div>

        <div class="space-y-1">
          <p class="font-medium">Page heading</p>
          <p>Misebox landing page</p>
        </div>

        <div class="space-y-1">
          <p class="font-medium">Section 1: Main</p>
          <p class="font-medium">Part 1: Hero text</p>
          <p>The Control Centre For Kitchen Operations.</p>
          <p class="font-semibold">Kitchen Console.</p>
          <p>
            Menus · Ingredients · Mise · QR · Recipes · Dishes · Stations ·
            Suppliers · Team · Tables · Orders · Finance
          </p>
        </div>

        <hr
          class="landing-practice-divider landing-practice-divider--part"
          aria-hidden="true"
        >

        <div class="space-y-1">
          <p class="font-medium">Section 1, Part 2: Hero component</p>
          <p>
            Live component direction: show a busy service as a calm,
            understandable flow of Kitchen Order tickets. The tickets use
            fictional, read-only Demo World data and load no account or live
            Orders.
          </p>
          <p class="text-sm text-muted">
            Rendered immediately below this practice block with the existing
            Kitchen Order rail and ticket components.
          </p>
        </div>

        <div>
          <p>Get started.</p>
        </div>

        <hr
          class="landing-practice-divider landing-practice-divider--section"
          aria-hidden="true"
        >

        <div class="space-y-1">
          <p class="font-medium">Section 2: Console</p>
        </div>

        <div class="space-y-1">
          <p class="font-medium">One Console for the whole kitchen.</p>
          <p>
            Core keeps your Kitchen identity, access and settings together.
            Kitchen operations organise the work your team carries out every
            day.
          </p>
          <p>
            The navigation stays flat so each operation is quick to reach.
            Misebox brings those operations together around the outcomes your
            restaurant needs.
          </p>
        </div>

        <hr
          class="landing-practice-divider landing-practice-divider--part"
          aria-hidden="true"
        >

        <div class="space-y-1">
          <p class="font-medium">What you can do:</p>
          <ul class="list-disc space-y-1 pl-5">
            <li>
              <strong>Create and publish:</strong>
              build menus from dishes, recipes and ingredients, then publish
              polished multilingual QR menus for guests.
            </li>
            <li>
              <strong>Prepare the team:</strong>
              plan mise and prep work across stations and keep team access
              clear.
            </li>
            <li>
              <strong>Run service:</strong>
              set up tables and move orders through the service queue to
              handoff.
            </li>
            <li>
              <strong>Manage supply and money:</strong>
              keep suppliers, catalogues and procurement details together,
              then review completed sales in Finance.
            </li>
          </ul>
        </div>

        <hr
          class="landing-practice-divider landing-practice-divider--part"
          aria-hidden="true"
        >

        <div class="space-y-1">
          <p class="font-medium">See the system at work.</p>
          <p>
            The polished multilingual menu your guests open is visible proof
            of the Kitchen Console behind it. The same workspace holds the
            dishes, recipes and Kitchen identity connected to that menu—and
            continues into preparation and service.
          </p>
          <p>
            The menu is the part your guests see. Misebox is the operating
            system your kitchen works from.
          </p>
        </div>

        <hr
          class="landing-practice-divider landing-practice-divider--part"
          aria-hidden="true"
        >

        <div class="space-y-1">
          <p class="font-medium">Bring your kitchen into one workspace.</p>
          <p>
            Start with your menu, then run preparation, service, suppliers and
            Finance from the same Kitchen Console.
          </p>
          <p class="font-semibold">Create your Kitchen Console.</p>
        </div>

        <hr
          class="landing-practice-divider landing-practice-divider--section"
          aria-hidden="true"
        >

        <div class="space-y-1">
          <p class="font-medium">Section 3: Next operation</p>
          <p>
            Working placeholder—the next most important operation has not been
            selected yet. The page will continue through Kitchen operations
            from here.
          </p>
        </div>
      </div>
    </UContainer>
  </aside>
</template>

<style scoped>
.landing-practice-divider {
  width: 100%;
  margin: calc(var(--spacing) * 2) 0;
  border: 0;
}

.landing-practice-divider--section {
  height: calc(var(--spacing) * 1);
  background: var(--ui-warning);
}

.landing-practice-divider--part {
  height: 1px;
  background: color-mix(in srgb, var(--ui-warning) 28%, transparent);
}
</style>
